import type { Activity } from "../types";
import type { Poi, PoiCategory } from "./places";

export type Pace = "relaxed" | "balanced" | "full";

export interface PlannerInput {
  dayCount: number;
  pace: Pace;
  /** Real nearby places, when the guide has loaded them. */
  pois: Record<PoiCategory, Poi[]> | null;
  /** Curated highlights for known destinations (may be empty). */
  highlights: string[];
  destination: string;
}

type Suggestion = Omit<Activity, "id">;

const GENERIC_SIGHTS = [
  "Explore the old town on foot",
  "Visit the local market",
  "Find the best viewpoint in town",
  "Museum or gallery morning",
  "Wander a neighborhood you haven't seen",
  "Sunset walk along the water",
  "Visit the main square & people-watch",
  "Day trip to a nearby town",
];

const GENERIC_RELAX = [
  "Slow morning — coffee & journaling",
  "Beach, pool, or park afternoon",
  "Spa, massage, or siesta",
  "Free time — follow your nose",
];

/**
 * Builds a day-by-day itinerary from the trip length, pace, and whatever
 * real place data is available. Pure and deterministic, so it's testable;
 * real nearby restaurants and sights are woven in when the guide has them.
 */
export function buildItinerary(input: PlannerInput): Suggestion[] {
  const { dayCount, pace, pois, highlights } = input;
  const out: Suggestion[] = [];

  let sightIdx = 0;
  let foodIdx = 0;
  let genericSightIdx = 0;
  let genericRelaxIdx = 0;

  const nextSight = (): { title: string; notes: string } => {
    const realSights = pois?.sights ?? [];
    if (sightIdx < realSights.length) {
      const p = realSights[sightIdx++];
      return { title: `Visit ${p.name}`, notes: "" };
    }
    if (sightIdx < realSights.length + highlights.length) {
      const h = highlights[sightIdx - realSights.length];
      sightIdx++;
      return { title: h, notes: "" };
    }
    const g = GENERIC_SIGHTS[genericSightIdx % GENERIC_SIGHTS.length];
    genericSightIdx++;
    return { title: g, notes: "" };
  };

  const nextMeal = (meal: "Lunch" | "Dinner"): { title: string; notes: string } => {
    const realFood = pois?.food ?? [];
    if (foodIdx < realFood.length) {
      const p = realFood[foodIdx++];
      return { title: `${meal} at ${p.name}`, notes: p.kind };
    }
    return { title: `${meal} somewhere local`, notes: "Ask a local for their favorite spot" };
  };

  const nextRelax = (): string => {
    const g = GENERIC_RELAX[genericRelaxIdx % GENERIC_RELAX.length];
    genericRelaxIdx++;
    return g;
  };

  const add = (dayIndex: number, time: string, title: string, category: Activity["category"], notes = "") =>
    out.push({ dayIndex, time, title, category, notes });

  const lastDay = dayCount - 1;

  // Arrival day
  add(0, "15:00", "Arrive, check in & drop bags", "lodging");
  add(0, "17:00", "First stroll to get your bearings", "sightseeing");
  {
    const dinner = nextMeal("Dinner");
    add(0, "19:30", dinner.title, "food", dinner.notes);
  }

  // Middle days
  for (let day = 1; day < lastDay; day++) {
    const sight = nextSight();
    add(day, "10:00", sight.title, "sightseeing", sight.notes);
    const lunch = nextMeal("Lunch");
    add(day, "13:00", lunch.title, "food", lunch.notes);
    if (pace !== "relaxed") {
      const afternoon = nextSight();
      add(day, "15:30", afternoon.title, "outdoors", afternoon.notes);
    } else if (day % 2 === 1) {
      add(day, "15:30", nextRelax(), "other");
    }
    if (pace === "full") {
      const dinner = nextMeal("Dinner");
      add(day, "19:30", dinner.title, "food", dinner.notes);
    }
  }

  // Departure day (only when the trip is longer than one day)
  if (lastDay > 0) {
    add(lastDay, "09:30", "Pack up & check out", "lodging");
    if (pace !== "relaxed") {
      const last = nextSight();
      add(lastDay, "10:30", last.title, "sightseeing", last.notes);
    }
    add(lastDay, "13:00", "Head to airport / station — safe travels!", "transport");
  }

  return out;
}
