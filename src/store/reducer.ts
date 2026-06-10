import type {
  Activity,
  AppState,
  Expense,
  PackingItem,
  Trip,
} from "../types";
import { uid } from "../lib/id";
import { tripDayCount } from "../lib/dates";
import { LEGACY_EMOJI_ICONS } from "../lib/icons";

export type TripDraft = Omit<
  Trip,
  "id" | "activities" | "expenses" | "packing" | "createdAt"
>;

export type Action =
  | { type: "trip/add"; draft: TripDraft; id?: string; packing?: string[] }
  | { type: "trip/update"; id: string; patch: Partial<TripDraft> }
  | { type: "trip/delete"; id: string }
  | { type: "activity/add"; tripId: string; activity: Omit<Activity, "id"> }
  | { type: "activity/addMany"; tripId: string; activities: Omit<Activity, "id">[] }
  | { type: "activity/update"; tripId: string; id: string; patch: Partial<Omit<Activity, "id">> }
  | { type: "activity/delete"; tripId: string; id: string }
  | { type: "expense/add"; tripId: string; expense: Omit<Expense, "id"> }
  | { type: "expense/delete"; tripId: string; id: string }
  | { type: "packing/add"; tripId: string; labels: string[] }
  | { type: "packing/toggle"; tripId: string; id: string }
  | { type: "packing/delete"; tripId: string; id: string }
  | { type: "packing/clearPacked"; tripId: string }
  | { type: "state/import"; state: AppState };

export const initialState: AppState = { version: 1, trips: [] };

function sortTrips(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function updateTrip(state: AppState, id: string, fn: (trip: Trip) => Trip): AppState {
  return {
    ...state,
    trips: state.trips.map((t) => (t.id === id ? fn(t) : t)),
  };
}

/** Drop activities that fall outside the (possibly shortened) trip date range. */
function clampActivities(trip: Trip): Trip {
  const days = tripDayCount(trip.startDate, trip.endDate);
  if (trip.activities.every((a) => a.dayIndex < days)) return trip;
  return { ...trip, activities: trip.activities.filter((a) => a.dayIndex < days) };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "trip/add": {
      const trip: Trip = {
        ...action.draft,
        id: action.id ?? uid(),
        activities: [],
        expenses: [],
        packing: (action.packing ?? []).map((label) => ({ id: uid(), label, packed: false })),
        createdAt: Date.now(),
      };
      return { ...state, trips: sortTrips([...state.trips, trip]) };
    }
    case "trip/update": {
      const next = updateTrip(state, action.id, (t) => clampActivities({ ...t, ...action.patch }));
      return { ...next, trips: sortTrips(next.trips) };
    }
    case "trip/delete":
      return { ...state, trips: state.trips.filter((t) => t.id !== action.id) };

    case "activity/add":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        activities: [...t.activities, { ...action.activity, id: uid() }],
      }));
    case "activity/addMany":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        activities: [...t.activities, ...action.activities.map((a) => ({ ...a, id: uid() }))],
      }));
    case "activity/update":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        activities: t.activities.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)),
      }));
    case "activity/delete":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        activities: t.activities.filter((a) => a.id !== action.id),
      }));

    case "expense/add":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        expenses: [...t.expenses, { ...action.expense, id: uid() }],
      }));
    case "expense/delete":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        expenses: t.expenses.filter((e) => e.id !== action.id),
      }));

    case "packing/add": {
      return updateTrip(state, action.tripId, (t) => {
        const seen = new Set(t.packing.map((p) => p.label.toLowerCase()));
        const fresh: PackingItem[] = [];
        for (const raw of action.labels) {
          const label = raw.trim();
          if (label === "" || seen.has(label.toLowerCase())) continue;
          seen.add(label.toLowerCase());
          fresh.push({ id: uid(), label, packed: false });
        }
        return { ...t, packing: [...t.packing, ...fresh] };
      });
    }
    case "packing/toggle":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        packing: t.packing.map((p) => (p.id === action.id ? { ...p, packed: !p.packed } : p)),
      }));
    case "packing/delete":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        packing: t.packing.filter((p) => p.id !== action.id),
      }));
    case "packing/clearPacked":
      return updateTrip(state, action.tripId, (t) => ({
        ...t,
        packing: t.packing.map((p) => ({ ...p, packed: false })),
      }));

    case "state/import":
      return action.state;
  }
}

/** Validate (loosely) and normalize a parsed JSON payload into AppState. */
export function sanitizeState(raw: unknown): AppState | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Record<string, unknown>;
  if (!Array.isArray(obj.trips)) return null;
  const trips: Trip[] = [];
  for (const t of obj.trips) {
    if (typeof t !== "object" || t === null) return null;
    const trip = t as Record<string, unknown>;
    if (
      typeof trip.name !== "string" ||
      typeof trip.startDate !== "string" ||
      typeof trip.endDate !== "string"
    ) {
      return null;
    }
    const tripIcon =
      typeof trip.icon === "string" && trip.icon !== ""
        ? trip.icon
        : typeof trip.emoji === "string"
          ? (LEGACY_EMOJI_ICONS[trip.emoji] ?? "globe")
          : "globe";
    trips.push({
      id: typeof trip.id === "string" ? trip.id : uid(),
      name: trip.name,
      destination: typeof trip.destination === "string" ? trip.destination : "",
      startDate: trip.startDate,
      endDate: trip.endDate,
      icon: tripIcon,
      lat: typeof trip.lat === "number" ? trip.lat : undefined,
      lon: typeof trip.lon === "number" ? trip.lon : undefined,
      countryCode: typeof trip.countryCode === "string" ? trip.countryCode : undefined,
      budget: typeof trip.budget === "number" && trip.budget >= 0 ? trip.budget : 0,
      currency: typeof trip.currency === "string" ? trip.currency : "USD",
      notes: typeof trip.notes === "string" ? trip.notes : "",
      activities: Array.isArray(trip.activities) ? (trip.activities as Activity[]) : [],
      expenses: Array.isArray(trip.expenses) ? (trip.expenses as Expense[]) : [],
      packing: Array.isArray(trip.packing) ? (trip.packing as PackingItem[]) : [],
      createdAt: typeof trip.createdAt === "number" ? trip.createdAt : Date.now(),
    });
  }
  return { version: 1, trips: sortTrips(trips) };
}
