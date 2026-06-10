export type ActivityCategory =
  | "food"
  | "sightseeing"
  | "transport"
  | "lodging"
  | "outdoors"
  | "nightlife"
  | "shopping"
  | "other";

export type ExpenseCategory =
  | "flights"
  | "lodging"
  | "food"
  | "transport"
  | "activities"
  | "shopping"
  | "other";

export interface Activity {
  id: string;
  /** 0-based index of the trip day this activity belongs to. */
  dayIndex: number;
  /** Optional HH:MM (24h). Empty string means unscheduled. */
  time: string;
  title: string;
  category: ActivityCategory;
  notes: string;
}

export interface Expense {
  id: string;
  label: string;
  category: ExpenseCategory;
  amount: number;
}

export interface PackingItem {
  id: string;
  label: string;
  packed: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  /** ISO date YYYY-MM-DD */
  startDate: string;
  /** ISO date YYYY-MM-DD, inclusive */
  endDate: string;
  /** Icon id, see src/lib/icons.ts */
  icon: string;
  budget: number;
  currency: string;
  notes: string;
  activities: Activity[];
  expenses: Expense[];
  packing: PackingItem[];
  createdAt: number;
}

export interface AppState {
  version: 1;
  trips: Trip[];
}

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string; icon: string }[] = [
  { value: "food", label: "Food & drink", icon: "food" },
  { value: "sightseeing", label: "Sightseeing", icon: "landmark" },
  { value: "transport", label: "Transport", icon: "train" },
  { value: "lodging", label: "Lodging", icon: "bed" },
  { value: "outdoors", label: "Outdoors", icon: "hiking" },
  { value: "nightlife", label: "Nightlife", icon: "music" },
  { value: "shopping", label: "Shopping", icon: "shopping" },
  { value: "other", label: "Other", icon: "pin" },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: "flights", label: "Flights", icon: "plane" },
  { value: "lodging", label: "Lodging", icon: "hotel" },
  { value: "food", label: "Food & drink", icon: "food" },
  { value: "transport", label: "Transport", icon: "taxi" },
  { value: "activities", label: "Activities", icon: "ticket" },
  { value: "shopping", label: "Shopping", icon: "shopping" },
  { value: "other", label: "Other", icon: "creditcard" },
];

export const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "JPY", "AUD", "CAD", "COP", "MXN", "THB"];
