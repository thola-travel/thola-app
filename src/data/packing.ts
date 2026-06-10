import { Briefcase, Building2, Mountain, Snowflake, Sun, type LucideIcon } from "lucide-react";

export interface PackingTemplate {
  id: string;
  label: string;
  Icon: LucideIcon;
  items: string[];
}

export const PACKING_ESSENTIALS: string[] = [
  "Passport / ID",
  "Phone charger",
  "Power bank",
  "Travel insurance details",
  "Medications",
  "Toiletries bag",
  "Underwear & socks",
  "Comfortable walking shoes",
  "Reusable water bottle",
];

export const PACKING_TEMPLATES: PackingTemplate[] = [
  {
    id: "beach",
    label: "Beach & sun",
    Icon: Sun,
    items: ["Swimsuit", "Sunscreen SPF 50", "Sunglasses", "Sun hat", "Flip flops", "Beach towel", "After-sun lotion", "Dry bag"],
  },
  {
    id: "cold",
    label: "Cold weather",
    Icon: Snowflake,
    items: ["Warm jacket", "Thermal layers", "Gloves", "Beanie", "Scarf", "Wool socks", "Lip balm", "Waterproof boots"],
  },
  {
    id: "hiking",
    label: "Hiking & outdoors",
    Icon: Mountain,
    items: ["Hiking boots", "Daypack", "Rain shell", "First aid kit", "Headlamp", "Trail snacks", "Insect repellent", "Trekking poles"],
  },
  {
    id: "city",
    label: "City break",
    Icon: Building2,
    items: ["Day bag", "Smart-casual outfit", "Umbrella", "Camera", "Offline maps downloaded", "Theft-proof bag"],
  },
  {
    id: "work",
    label: "Work trip",
    Icon: Briefcase,
    items: ["Laptop & charger", "Business attire", "Notebook & pen", "Presentation materials", "Travel adapter", "Lint roller"],
  },
];
