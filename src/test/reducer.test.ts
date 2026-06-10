import { describe, expect, it } from "vitest";
import { initialState, reducer, sanitizeState, type Action, type TripDraft } from "../store/reducer";
import type { AppState } from "../types";

const draft: TripDraft = {
  name: "San Andrés",
  destination: "San Andrés, Colombia",
  startDate: "2026-07-01",
  endDate: "2026-07-06",
  emoji: "🌊",
  budget: 1900,
  currency: "USD",
  notes: "",
};

function withTrip(packing: string[] = []): { state: AppState; id: string } {
  const state = reducer(initialState, { type: "trip/add", draft, id: "t1", packing });
  return { state, id: "t1" };
}

describe("trip actions", () => {
  it("adds a trip with seeded packing list", () => {
    const { state } = withTrip(["Passport", "Sunscreen"]);
    expect(state.trips).toHaveLength(1);
    expect(state.trips[0].name).toBe("San Andrés");
    expect(state.trips[0].packing.map((p) => p.label)).toEqual(["Passport", "Sunscreen"]);
    expect(state.trips[0].packing.every((p) => !p.packed)).toBe(true);
  });

  it("keeps trips sorted by start date", () => {
    let state = withTrip().state;
    state = reducer(state, {
      type: "trip/add",
      draft: { ...draft, name: "Earlier", startDate: "2026-01-05", endDate: "2026-01-08" },
      id: "t2",
    });
    expect(state.trips.map((t) => t.name)).toEqual(["Earlier", "San Andrés"]);
  });

  it("updates a trip", () => {
    const { state, id } = withTrip();
    const next = reducer(state, { type: "trip/update", id, patch: { budget: 2500 } });
    expect(next.trips[0].budget).toBe(2500);
  });

  it("drops activities that fall outside a shortened date range", () => {
    let { state, id } = withTrip();
    state = reducer(state, {
      type: "activity/add",
      tripId: id,
      activity: { dayIndex: 5, time: "", title: "Last day brunch", category: "food", notes: "" },
    });
    state = reducer(state, {
      type: "activity/add",
      tripId: id,
      activity: { dayIndex: 0, time: "09:00", title: "Arrival", category: "transport", notes: "" },
    });
    const next = reducer(state, { type: "trip/update", id, patch: { endDate: "2026-07-03" } });
    expect(next.trips[0].activities.map((a) => a.title)).toEqual(["Arrival"]);
  });

  it("deletes a trip", () => {
    const { state, id } = withTrip();
    expect(reducer(state, { type: "trip/delete", id }).trips).toHaveLength(0);
  });
});

describe("activity actions", () => {
  it("adds, updates and deletes activities", () => {
    let { state, id } = withTrip();
    state = reducer(state, {
      type: "activity/add",
      tripId: id,
      activity: { dayIndex: 1, time: "10:00", title: "Johnny Cay", category: "outdoors", notes: "" },
    });
    const actId = state.trips[0].activities[0].id;
    expect(state.trips[0].activities).toHaveLength(1);

    state = reducer(state, {
      type: "activity/update",
      tripId: id,
      id: actId,
      patch: { time: "11:30" },
    });
    expect(state.trips[0].activities[0].time).toBe("11:30");

    state = reducer(state, { type: "activity/delete", tripId: id, id: actId });
    expect(state.trips[0].activities).toHaveLength(0);
  });
});

describe("expense actions", () => {
  it("adds and deletes expenses", () => {
    let { state, id } = withTrip();
    state = reducer(state, {
      type: "expense/add",
      tripId: id,
      expense: { label: "Flights", category: "flights", amount: 1050 },
    });
    expect(state.trips[0].expenses[0].amount).toBe(1050);
    const expId = state.trips[0].expenses[0].id;
    state = reducer(state, { type: "expense/delete", tripId: id, id: expId });
    expect(state.trips[0].expenses).toHaveLength(0);
  });
});

describe("packing actions", () => {
  it("adds items, skipping duplicates case-insensitively and blanks", () => {
    let { state, id } = withTrip(["Passport"]);
    state = reducer(state, {
      type: "packing/add",
      tripId: id,
      labels: ["passport", "  ", "Snorkel", "Snorkel"],
    });
    expect(state.trips[0].packing.map((p) => p.label)).toEqual(["Passport", "Snorkel"]);
  });

  it("toggles, deletes, and resets packed state", () => {
    let { state, id } = withTrip(["Passport", "Sunscreen"]);
    const [a, b] = state.trips[0].packing;

    state = reducer(state, { type: "packing/toggle", tripId: id, id: a.id });
    state = reducer(state, { type: "packing/toggle", tripId: id, id: b.id });
    expect(state.trips[0].packing.every((p) => p.packed)).toBe(true);

    state = reducer(state, { type: "packing/clearPacked", tripId: id });
    expect(state.trips[0].packing.every((p) => !p.packed)).toBe(true);

    state = reducer(state, { type: "packing/delete", tripId: id, id: a.id });
    expect(state.trips[0].packing.map((p) => p.label)).toEqual(["Sunscreen"]);
  });
});

describe("sanitizeState", () => {
  it("accepts a valid exported state and sorts trips", () => {
    const raw = {
      version: 1,
      trips: [
        { name: "B", startDate: "2026-08-01", endDate: "2026-08-05" },
        { name: "A", startDate: "2026-02-01", endDate: "2026-02-03" },
      ],
    };
    const state = sanitizeState(raw);
    expect(state).not.toBeNull();
    expect(state!.trips.map((t) => t.name)).toEqual(["A", "B"]);
    expect(state!.trips[0].currency).toBe("USD");
    expect(state!.trips[0].activities).toEqual([]);
  });

  it("rejects garbage", () => {
    expect(sanitizeState(null)).toBeNull();
    expect(sanitizeState("nope")).toBeNull();
    expect(sanitizeState({ trips: "nope" })).toBeNull();
    expect(sanitizeState({ trips: [{ name: 42 }] })).toBeNull();
  });

  it("round-trips through reducer import", () => {
    const { state } = withTrip(["Passport"]);
    const restored = sanitizeState(JSON.parse(JSON.stringify(state)));
    expect(restored).not.toBeNull();
    const imported = reducer(initialState, { type: "state/import", state: restored! } as Action);
    expect(imported.trips[0].name).toBe("San Andrés");
    expect(imported.trips[0].packing[0].label).toBe("Passport");
  });
});
