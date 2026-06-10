export interface PackingTemplate {
  id: string;
  label: string;
  icon: string;
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
    icon: "sun",
    items: ["Swimsuit", "Sunscreen SPF 50", "Sunglasses", "Sun hat", "Flip flops", "Beach towel", "After-sun lotion", "Dry bag"],
  },
  {
    id: "cold",
    label: "Cold weather",
    icon: "snowflake",
    items: ["Warm jacket", "Thermal layers", "Gloves", "Beanie", "Scarf", "Wool socks", "Lip balm", "Waterproof boots"],
  },
  {
    id: "hiking",
    label: "Hiking & outdoors",
    icon: "hiking",
    items: ["Hiking boots", "Daypack", "Rain shell", "First aid kit", "Headlamp", "Trail snacks", "Insect repellent", "Trekking poles"],
  },
  {
    id: "city",
    label: "City break",
    icon: "city",
    items: ["Day bag", "Smart-casual outfit", "Umbrella", "Camera", "Offline maps downloaded", "Theft-proof bag"],
  },
  {
    id: "work",
    label: "Work trip",
    icon: "work",
    items: ["Laptop & charger", "Business attire", "Notebook & pen", "Presentation materials", "Travel adapter", "Lint roller"],
  },
];
