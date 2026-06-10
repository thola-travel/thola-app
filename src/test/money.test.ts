import { describe, expect, it } from "vitest";
import { formatMoney, parseAmount, totalExpenses } from "../lib/money";

describe("formatMoney", () => {
  it("formats whole amounts without cents", () => {
    expect(formatMoney(1900, "USD")).toBe("$1,900");
  });

  it("formats fractional amounts with cents, even after a whole-amount call", () => {
    expect(formatMoney(100, "USD")).toBe("$100");
    expect(formatMoney(12.5, "USD")).toBe("$12.50");
  });

  it("falls back gracefully for unknown currency codes", () => {
    expect(formatMoney(100, "NOT_A_CODE")).toContain("100");
  });
});

describe("parseAmount", () => {
  it("parses plain and formatted numbers", () => {
    expect(parseAmount("1900")).toBe(1900);
    expect(parseAmount("1,900.50")).toBe(1900.5);
    expect(parseAmount("$ 45")).toBe(45);
  });

  it("returns NaN for invalid or negative input", () => {
    expect(parseAmount("")).toBeNaN();
    expect(parseAmount("abc")).toBeNaN();
    expect(parseAmount("-50")).toBeNaN();
  });
});

describe("totalExpenses", () => {
  it("sums amounts", () => {
    expect(totalExpenses([{ amount: 10 }, { amount: 2.5 }])).toBe(12.5);
    expect(totalExpenses([])).toBe(0);
  });
});
