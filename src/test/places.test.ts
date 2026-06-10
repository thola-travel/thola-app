import { describe, expect, it } from "vitest";
import { bucketOverpass, parseNominatim } from "../lib/places";
import { distanceMeters, formatDistance } from "../lib/geo";
import { getEmergencyNumbers, EMERGENCY_FALLBACK } from "../data/emergency";

describe("parseNominatim", () => {
  it("parses real-shaped Nominatim rows", () => {
    const rows = [
      {
        name: "San Andrés",
        display_name: "San Andrés, Archipiélago de San Andrés, Colombia",
        lat: "12.5847",
        lon: "-81.7006",
        type: "island",
        address: { country_code: "co" },
      },
    ];
    const out = parseNominatim(rows);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe("San Andrés");
    expect(out[0].lat).toBeCloseTo(12.5847);
    expect(out[0].countryCode).toBe("co");
  });

  it("skips malformed rows and non-arrays", () => {
    expect(parseNominatim(null)).toEqual([]);
    expect(parseNominatim([{ lat: "not-a-number", lon: "1", display_name: "x" }])).toEqual([]);
    expect(parseNominatim([{ lat: "1" }])).toEqual([]);
  });
});

describe("bucketOverpass", () => {
  const payload = {
    elements: [
      { type: "node", id: 1, lat: 12.585, lon: -81.7, tags: { amenity: "restaurant", name: "La Regatta" } },
      { type: "node", id: 2, lat: 12.586, lon: -81.701, tags: { amenity: "pharmacy", name: "Farmacia Central" } },
      { type: "node", id: 3, lat: 12.59, lon: -81.71, tags: { amenity: "police", name: "Policía San Andrés" } },
      { type: "way", id: 4, center: { lat: 12.58, lon: -81.69 }, tags: { tourism: "attraction", name: "Johnny Cay" } },
      { type: "node", id: 5, lat: 12.58, lon: -81.69, tags: { amenity: "restaurant" } }, // unnamed → skipped
      { type: "node", id: 6, lat: 12.585, lon: -81.7, tags: { amenity: "restaurant", name: "la regatta" } }, // dup → skipped
      { type: "node", id: 7, lat: 12.581, lon: -81.699, tags: { historic: "monument", name: "Old Monument" } },
    ],
  };

  it("buckets by category, dedupes, and sorts by distance", () => {
    const buckets = bucketOverpass(payload, 12.5847, -81.7006);
    expect(buckets.food.map((p) => p.name)).toEqual(["La Regatta"]);
    expect(buckets.medical[0].name).toBe("Farmacia Central");
    expect(buckets.emergency[0].name).toBe("Policía San Andrés");
    expect(buckets.sights.map((p) => p.name)).toContain("Johnny Cay");
    expect(buckets.sights.map((p) => p.name)).toContain("Old Monument");
    for (const list of Object.values(buckets)) {
      for (let i = 1; i < list.length; i++) {
        expect(list[i].distanceM).toBeGreaterThanOrEqual(list[i - 1].distanceM);
      }
    }
  });

  it("tolerates garbage payloads", () => {
    expect(bucketOverpass(null, 0, 0)).toEqual({ food: [], sights: [], medical: [], emergency: [] });
    expect(bucketOverpass({ elements: "nope" }, 0, 0).food).toEqual([]);
  });
});

describe("geo", () => {
  it("computes plausible distances", () => {
    // Bogotá to San Andrés is roughly 1,190 km
    const d = distanceMeters(4.711, -74.0721, 12.5847, -81.7006);
    expect(d).toBeGreaterThan(1_100_000);
    expect(d).toBeLessThan(1_300_000);
  });

  it("formats distances for humans", () => {
    expect(formatDistance(140)).toBe("140 m");
    expect(formatDistance(2350)).toBe("2.4 km");
  });
});

describe("emergency numbers", () => {
  it("returns country-specific numbers", () => {
    expect(getEmergencyNumbers("co").police).toBe("123");
    expect(getEmergencyNumbers("JP").ambulance).toBe("119");
    expect(getEmergencyNumbers("za").police).toBe("10111");
  });

  it("falls back to 112 for unknown countries", () => {
    expect(getEmergencyNumbers("zz")).toBe(EMERGENCY_FALLBACK);
    expect(getEmergencyNumbers(undefined).police).toBe("112");
  });
});
