const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, fractionDigits: number): Intl.NumberFormat {
  const key = `${currency}:${fractionDigits}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat("en", {
        style: "currency",
        currency,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
    } catch {
      fmt = new Intl.NumberFormat("en", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      });
    }
    formatters.set(key, fmt);
  }
  return fmt;
}

export function formatMoney(amount: number, currency: string): string {
  const fractionDigits = Math.abs(amount % 1) < 0.005 ? 0 : 2;
  return getFormatter(currency, fractionDigits).format(amount);
}

/** Parse user-entered amount; returns NaN when invalid. */
export function parseAmount(input: string): number {
  const cleaned = input.replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  if (cleaned === "") return NaN;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? value : NaN;
}

export function totalExpenses(expenses: { amount: number }[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}
