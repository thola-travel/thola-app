import {
  BedDouble,
  CarTaxiFront,
  CreditCard,
  Hotel,
  Landmark,
  MapPin,
  Mountain,
  Music,
  Plane,
  ShoppingBag,
  Ticket,
  TrainFront,
  Utensils,
  type LucideIcon,
} from "lucide-react";

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

export const ACTIVITY_CATEGORIES: { value: ActivityCategory; label: string; Icon: LucideIcon }[] = [
  { value: "food", label: "Food & drink", Icon: Utensils },
  { value: "sightseeing", label: "Sightseeing", Icon: Landmark },
  { value: "transport", label: "Transport", Icon: TrainFront },
  { value: "lodging", label: "Lodging", Icon: BedDouble },
  { value: "outdoors", label: "Outdoors", Icon: Mountain },
  { value: "nightlife", label: "Nightlife", Icon: Music },
  { value: "shopping", label: "Shopping", Icon: ShoppingBag },
  { value: "other", label: "Other", Icon: MapPin },
];

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; Icon: LucideIcon }[] = [
  { value: "flights", label: "Flights", Icon: Plane },
  { value: "lodging", label: "Lodging", Icon: Hotel },
  { value: "food", label: "Food & drink", Icon: Utensils },
  { value: "transport", label: "Transport", Icon: CarTaxiFront },
  { value: "activities", label: "Activities", Icon: Ticket },
  { value: "shopping", label: "Shopping", Icon: ShoppingBag },
  { value: "other", label: "Other", Icon: CreditCard },
];

export const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "JPY", "AUD", "CAD", "COP", "MXN", "THB"];
