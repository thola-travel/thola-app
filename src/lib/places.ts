import { distanceMeters } from "./geo";

/** A real-world place returned by OpenStreetMap's Nominatim search. */
export interface PlaceResult {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  /** ISO 3166-1 alpha-2, lowercase. */
  countryCode?: string;
  kind: string;
}

interface NominatimRow {
  name?: string;
  display_name?: string;
  lat?: string;
  lon?: string;
  type?: string;
  address?: { country_code?: string };
}

export function parseNominatim(rows: unknown): PlaceResult[] {
  if (!Array.isArray(rows)) return [];
  const out: PlaceResult[] = [];
  for (const r of rows as NominatimRow[]) {
    const lat = Number(r.lat);
    const lon = Number(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !r.display_name) continue;
    out.push({
      name: r.name || r.display_name.split(",")[0],
      displayName: r.display_name,
      lat,
      lon,
      countryCode: r.address?.country_code,
      kind: r.type ?? "place",
    });
  }
  return out;
}

/** Search real places worldwide (OpenStreetMap Nominatim, no key needed). */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=" +
    encodeURIComponent(query);
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  return parseNominatim(await res.json());
}

export type PoiCategory = "food" | "sights" | "medical" | "emergency";

export interface Poi {
  id: string;
  name: string;
  category: PoiCategory;
  /** e.g. "restaurant", "museum", "pharmacy", "police" */
  kind: string;
  lat: number;
  lon: number;
  distanceM: number;
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const FOOD = new Set(["restaurant", "cafe", "fast_food", "food_court", "ice_cream"]);
const MEDICAL = new Set(["hospital", "pharmacy", "clinic", "doctors", "dentist"]);
const EMERGENCY = new Set(["police", "fire_station"]);
const SIGHTS = new Set(["attraction", "museum", "viewpoint", "gallery", "zoo", "theme_park", "artwork"]);

export function bucketOverpass(payload: unknown, lat: number, lon: number): Record<PoiCategory, Poi[]> {
  const buckets: Record<PoiCategory, Poi[]> = { food: [], sights: [], medical: [], emergency: [] };
  const elements = (payload as { elements?: OverpassElement[] })?.elements;
  if (!Array.isArray(elements)) return buckets;
  const seen = new Set<string>();
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    const plat = el.lat ?? el.center?.lat;
    const plon = el.lon ?? el.center?.lon;
    if (!name || plat === undefined || plon === undefined) continue;
    const amenity = tags.amenity ?? "";
    const tourism = tags.tourism ?? "";
    let category: PoiCategory | null = null;
    let kind = "";
    if (FOOD.has(amenity)) (category = "food"), (kind = amenity);
    else if (MEDICAL.has(amenity)) (category = "medical"), (kind = amenity);
    else if (EMERGENCY.has(amenity)) (category = "emergency"), (kind = amenity);
    else if (SIGHTS.has(tourism)) (category = "sights"), (kind = tourism);
    else if (tags.historic) (category = "sights"), (kind = tags.historic);
    if (!category) continue;
    const key = `${category}:${name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    buckets[category].push({
      id: `${el.type}/${el.id}`,
      name,
      category,
      kind: kind.replace(/_/g, " "),
      lat: plat,
      lon: plon,
      distanceM: Math.round(distanceMeters(lat, lon, plat, plon)),
    });
  }
  for (const cat of Object.keys(buckets) as PoiCategory[]) {
    buckets[cat].sort((a, b) => a.distanceM - b.distanceM);
    buckets[cat] = buckets[cat].slice(0, 12);
  }
  return buckets;
}

/** Fetch real nearby spots from OpenStreetMap's Overpass API (no key needed). */
export async function fetchNearby(
  lat: number,
  lon: number,
  radiusM = 3000,
  signal?: AbortSignal
): Promise<Record<PoiCategory, Poi[]>> {
  const query = `[out:json][timeout:25];
(
  nwr["amenity"~"^(restaurant|cafe|fast_food|food_court|ice_cream|hospital|pharmacy|clinic|doctors|dentist|police|fire_station)$"]["name"](around:${radiusM},${lat},${lon});
  nwr["tourism"~"^(attraction|museum|viewpoint|gallery|zoo|theme_park|artwork)$"]["name"](around:${radiusM},${lat},${lon});
);
out tags center 400;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(query),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal,
  });
  if (!res.ok) throw new Error(`Nearby search failed (${res.status})`);
  return bucketOverpass(await res.json(), lat, lon);
}

const GUIDE_CACHE_PREFIX = "mizdon.guide.v1.";
const GUIDE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // a week

export function loadCachedGuide(tripId: string): Record<PoiCategory, Poi[]> | null {
  try {
    const raw = localStorage.getItem(GUIDE_CACHE_PREFIX + tripId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: Record<PoiCategory, Poi[]> };
    if (Date.now() - parsed.at > GUIDE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveCachedGuide(tripId: string, data: Record<PoiCategory, Poi[]>): void {
  try {
    localStorage.setItem(GUIDE_CACHE_PREFIX + tripId, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // cache is best-effort
  }
}
