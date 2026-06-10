/** Parse a YYYY-MM-DD string as a local date (avoids UTC off-by-one). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isValidISODate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = parseISODate(iso);
  return toISODate(date) === iso;
}

/** Number of days in a trip, inclusive of both start and end. Minimum 1. */
export function tripDayCount(startDate: string, endDate: string): number {
  const ms = parseISODate(endDate).getTime() - parseISODate(startDate).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

/** Date of the nth (0-based) day of a trip. */
export function dateOfDay(startDate: string, dayIndex: number): Date {
  const d = parseISODate(startDate);
  d.setDate(d.getDate() + dayIndex);
  return d;
}

/** Whole days from `today` until the trip starts. Negative if already started. */
export function daysUntil(startDate: string, today = new Date()): number {
  const start = parseISODate(startDate);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((start.getTime() - t.getTime()) / 86_400_000);
}

export type TripPhase = "upcoming" | "active" | "past";

export function tripPhase(startDate: string, endDate: string, today = new Date()): TripPhase {
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (t < parseISODate(startDate).getTime()) return "upcoming";
  if (t > parseISODate(endDate).getTime()) return "past";
  return "active";
}

const DATE_FMT = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const DATE_FMT_FULL = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function formatDateShort(iso: string): string {
  return DATE_FMT.format(parseISODate(iso));
}

export function formatDayLabel(date: Date): string {
  return DATE_FMT_FULL.format(date);
}

export function formatRange(startDate: string, endDate: string): string {
  const startYear = parseISODate(startDate).getFullYear();
  const endYear = parseISODate(endDate).getFullYear();
  const year = startYear === endYear ? `, ${endYear}` : ` ${startYear} – ${formatDateShort(endDate)}, ${endYear}`;
  if (startYear !== endYear) return `${formatDateShort(startDate)}${year}`;
  return `${formatDateShort(startDate)} – ${formatDateShort(endDate)}${year}`;
}
