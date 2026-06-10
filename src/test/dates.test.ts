import { describe, expect, it } from "vitest";
import {
  dateOfDay,
  daysUntil,
  formatRange,
  isValidISODate,
  parseISODate,
  toISODate,
  tripDayCount,
  tripPhase,
} from "../lib/dates";

describe("parseISODate / toISODate", () => {
  it("round-trips a date without timezone drift", () => {
    expect(toISODate(parseISODate("2026-07-01"))).toBe("2026-07-01");
    expect(toISODate(parseISODate("2026-01-31"))).toBe("2026-01-31");
    expect(toISODate(parseISODate("2026-12-31"))).toBe("2026-12-31");
  });

  it("parses as local midnight", () => {
    const d = parseISODate("2026-07-04");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(6);
    expect(d.getDate()).toBe(4);
    expect(d.getHours()).toBe(0);
  });
});

describe("isValidISODate", () => {
  it("accepts real dates", () => {
    expect(isValidISODate("2026-07-01")).toBe(true);
    expect(isValidISODate("2024-02-29")).toBe(true);
  });

  it("rejects malformed or impossible dates", () => {
    expect(isValidISODate("")).toBe(false);
    expect(isValidISODate("2026-7-1")).toBe(false);
    expect(isValidISODate("2026-02-30")).toBe(false);
    expect(isValidISODate("2025-02-29")).toBe(false);
    expect(isValidISODate("not a date")).toBe(false);
  });
});

describe("tripDayCount", () => {
  it("counts inclusively", () => {
    expect(tripDayCount("2026-07-01", "2026-07-06")).toBe(6);
    expect(tripDayCount("2026-07-01", "2026-07-01")).toBe(1);
  });

  it("spans month boundaries", () => {
    expect(tripDayCount("2026-06-29", "2026-07-02")).toBe(4);
  });

  it("never returns less than 1", () => {
    expect(tripDayCount("2026-07-06", "2026-07-01")).toBe(1);
  });
});

describe("dateOfDay", () => {
  it("returns the nth day of the trip", () => {
    expect(toISODate(dateOfDay("2026-07-01", 0))).toBe("2026-07-01");
    expect(toISODate(dateOfDay("2026-07-01", 5))).toBe("2026-07-06");
    expect(toISODate(dateOfDay("2026-06-29", 3))).toBe("2026-07-02");
  });
});

describe("daysUntil", () => {
  it("counts whole days from today", () => {
    const today = new Date(2026, 5, 10, 15, 30);
    expect(daysUntil("2026-06-11", today)).toBe(1);
    expect(daysUntil("2026-06-10", today)).toBe(0);
    expect(daysUntil("2026-07-01", today)).toBe(21);
    expect(daysUntil("2026-06-09", today)).toBe(-1);
  });
});

describe("tripPhase", () => {
  const today = new Date(2026, 5, 10);
  it("classifies upcoming, active and past trips", () => {
    expect(tripPhase("2026-07-01", "2026-07-06", today)).toBe("upcoming");
    expect(tripPhase("2026-06-08", "2026-06-12", today)).toBe("active");
    expect(tripPhase("2026-06-10", "2026-06-10", today)).toBe("active");
    expect(tripPhase("2026-05-01", "2026-05-05", today)).toBe("past");
  });
});

describe("formatRange", () => {
  it("formats a same-year range once", () => {
    expect(formatRange("2026-07-01", "2026-07-06")).toBe("Jul 1 – Jul 6, 2026");
  });

  it("includes both years when they differ", () => {
    expect(formatRange("2026-12-28", "2027-01-03")).toContain("2026");
    expect(formatRange("2026-12-28", "2027-01-03")).toContain("2027");
  });
});
