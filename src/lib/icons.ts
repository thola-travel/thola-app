import {
  Backpack,
  Briefcase,
  Building2,
  Car,
  FerrisWheel,
  Flower2,
  Globe,
  Heart,
  Landmark,
  Mountain,
  MountainSnow,
  Plane,
  Ship,
  Tent,
  TramFront,
  TreePalm,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";

/** Icons a trip (or destination) can be tagged with, stored by id. */
export const ICON_MAP: Record<string, LucideIcon> = {
  globe: Globe,
  beach: TreePalm,
  mountain: Mountain,
  "mountain-snow": MountainSnow,
  city: Building2,
  backpack: Backpack,
  flight: Plane,
  roadtrip: Car,
  cruise: Ship,
  camping: Tent,
  themepark: FerrisWheel,
  work: Briefcase,
  romance: Heart,
  waves: Waves,
  landmark: Landmark,
  food: Utensils,
  tram: TramFront,
  flower: Flower2,
};

export const TRIP_ICON_CHOICES: { id: string; label: string }[] = [
  { id: "globe", label: "Globe" },
  { id: "beach", label: "Beach" },
  { id: "mountain", label: "Mountains" },
  { id: "city", label: "City" },
  { id: "backpack", label: "Backpacking" },
  { id: "flight", label: "Flight" },
  { id: "roadtrip", label: "Road trip" },
  { id: "cruise", label: "Cruise" },
  { id: "camping", label: "Camping" },
  { id: "themepark", label: "Theme park" },
  { id: "work", label: "Work" },
  { id: "romance", label: "Romance" },
];

export function getIcon(id: string): LucideIcon {
  return ICON_MAP[id] ?? Globe;
}

/** Maps trip icons stored as emoji by earlier builds onto icon ids. */
export const LEGACY_EMOJI_ICONS: Record<string, string> = {
  "🌍": "globe",
  "🏝️": "beach",
  "⛰️": "mountain",
  "🏔️": "mountain-snow",
  "🏙️": "city",
  "🎒": "backpack",
  "🛫": "flight",
  "🚗": "roadtrip",
  "🛳️": "cruise",
  "🏕️": "camping",
  "🎢": "themepark",
  "💼": "work",
  "❤️": "romance",
  "🌊": "waves",
};
