import { describe, expect, it } from "vitest";
import { buildItinerary } from "../lib/planner";
import type { Poi, PoiCategory } from "../lib/places";

function poi(name: string, category: PoiCategory, kind = "restaurant"): Poi {
  return { id: name, name, category, kind, lat: 0, lon: 0, distanceM: 100 };
}

const POIS: Record<PoiCategory, Poi[]> = {
  food: [poi("La Regatta", "food"), poi("Café Sol", "food", "cafe")],
  sights: [poi("Johnny Cay", "sights", "attraction"), poi("First Baptist Church", "sights", "attraction")],
  medical: [],
  emergency: [],
};

describe("buildItinerary", () => {
  it("covers arrival, middle days, and departure", () => {
    const plan = buildItinerary({
      dayCount: 4,
      pace: "balanced",
      pois: null,
      highlights: [],
      destination: "Anywhere",
    });
    const days = new Set(plan.map((p) => p.dayIndex));
    expect(days).toEqual(new Set([0, 1, 2, 3]));
    expect(plan[0].title).toContain("Arrive");
    expect(plan.some((p) => p.title.includes("check out"))).toBe(true);
    expect(plan.some((p) => p.title.includes("airport"))).toBe(true);
  });

  it("never plans outside the trip's day range", () => {
    for (const dayCount of [1, 2, 5, 10]) {
      const plan = buildItinerary({
        dayCount,
        pace: "full",
        pois: POIS,
        highlights: ["A", "B"],
        destination: "X",
      });
      expect(plan.every((p) => p.dayIndex >= 0 && p.dayIndex < dayCount)).toBe(true);
    }
  });

  it("weaves in real nearby places when available", () => {
    const plan = buildItinerary({
      dayCount: 4,
      pace: "balanced",
      pois: POIS,
      highlights: [],
      destination: "San Andrés",
    });
    const titles = plan.map((p) => p.title).join(" | ");
    expect(titles).toContain("La Regatta");
    expect(titles).toContain("Johnny Cay");
  });

  it("falls back to curated highlights, then generic ideas", () => {
    const plan = buildItinerary({
      dayCount: 5,
      pace: "full",
      pois: null,
      highlights: ["Spratt Bight beach", "Hoyo Soplador blowhole"],
      destination: "San Andrés",
    });
    const titles = plan.map((p) => p.title).join(" | ");
    expect(titles).toContain("Spratt Bight beach");
    expect(titles).toContain("Hoyo Soplador blowhole");
  });

  it("plans more for a full pace than a relaxed one", () => {
    const relaxed = buildItinerary({ dayCount: 5, pace: "relaxed", pois: POIS, highlights: [], destination: "X" });
    const full = buildItinerary({ dayCount: 5, pace: "full", pois: POIS, highlights: [], destination: "X" });
    expect(full.length).toBeGreaterThan(relaxed.length);
  });

  it("handles a single-day trip without a departure block", () => {
    const plan = buildItinerary({ dayCount: 1, pace: "balanced", pois: null, highlights: [], destination: "X" });
    expect(plan.every((p) => p.dayIndex === 0)).toBe(true);
    expect(plan.some((p) => p.title.includes("airport"))).toBe(false);
  });
});
