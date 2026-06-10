export interface Destination {
  id: string;
  name: string;
  country: string;
  /** Icon id, see src/lib/icons.ts */
  icon: string;
  region: "Africa" | "Americas" | "Asia" | "Europe" | "Oceania";
  blurb: string;
  bestTime: string;
  /** 1 = budget-friendly, 2 = moderate, 3 = splurge */
  costLevel: 1 | 2 | 3;
  suggestedDays: number;
  tags: string[];
  highlights: string[];
}

export const DESTINATIONS: Destination[] = [
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    icon: "mountain",
    region: "Africa",
    blurb:
      "Where two oceans meet beneath Table Mountain — beaches, vineyards, and one of the world's most dramatic coastlines.",
    bestTime: "Nov – Mar",
    costLevel: 2,
    suggestedDays: 6,
    tags: ["beach", "nature", "food & wine", "city"],
    highlights: ["Table Mountain cableway", "Boulders Beach penguins", "Chapman's Peak Drive", "Stellenbosch winelands"],
  },
  {
    id: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    icon: "beach",
    region: "Africa",
    blurb:
      "Spice-scented alleys of Stone Town and turquoise water that barely looks real. Slow island time done right.",
    bestTime: "Jun – Oct",
    costLevel: 2,
    suggestedDays: 5,
    tags: ["beach", "island", "history", "snorkeling"],
    highlights: ["Stone Town old quarter", "Nungwi beach", "Spice farm tour", "Mnemba Atoll snorkeling"],
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    icon: "landmark",
    region: "Africa",
    blurb:
      "A sensory overload in the best way — souks, riads, mint tea on rooftops, and the Atlas Mountains an hour away.",
    bestTime: "Mar – May, Sep – Nov",
    costLevel: 1,
    suggestedDays: 4,
    tags: ["culture", "food", "markets", "desert"],
    highlights: ["Jemaa el-Fnaa at sunset", "Jardin Majorelle", "Atlas Mountains day trip", "Hammam ritual"],
  },
  {
    id: "san-andres",
    name: "San Andrés",
    country: "Colombia",
    icon: "waves",
    region: "Americas",
    blurb:
      "Colombia's Caribbean island with a sea of seven colors. Snorkel the cays by day, beach bars by night.",
    bestTime: "Jan – Jun",
    costLevel: 1,
    suggestedDays: 5,
    tags: ["beach", "island", "snorkeling", "budget"],
    highlights: ["Johnny Cay boat trip", "Spratt Bight beach", "Hoyo Soplador blowhole", "West View snorkeling"],
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    icon: "food",
    region: "Americas",
    blurb:
      "One of the world's great food cities, layered with Aztec ruins, murals, and leafy neighborhoods made for walking.",
    bestTime: "Mar – May, Oct – Nov",
    costLevel: 1,
    suggestedDays: 5,
    tags: ["food", "culture", "city", "museums"],
    highlights: ["Teotihuacán pyramids", "Frida Kahlo Museum", "Roma & Condesa food crawl", "Xochimilco canals"],
  },
  {
    id: "cusco",
    name: "Cusco & Machu Picchu",
    country: "Peru",
    icon: "mountain-snow",
    region: "Americas",
    blurb:
      "The Inca capital and its crown jewel. Cobblestone streets, Andean markets, and the trek of a lifetime.",
    bestTime: "May – Sep",
    costLevel: 2,
    suggestedDays: 6,
    tags: ["hiking", "history", "mountains", "bucket list"],
    highlights: ["Machu Picchu at sunrise", "Sacred Valley", "Rainbow Mountain", "San Pedro market"],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    icon: "city",
    region: "Asia",
    blurb:
      "Neon canyons, silent shrines, and the best convenience-store snacks on earth. A city that rewards wandering.",
    bestTime: "Mar – Apr, Oct – Nov",
    costLevel: 2,
    suggestedDays: 7,
    tags: ["city", "food", "culture", "shopping"],
    highlights: ["Shibuya crossing", "Tsukiji outer market", "Day trip to Hakone", "Senso-ji at dawn"],
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    icon: "landmark",
    region: "Asia",
    blurb:
      "Golden temples, canal boats, and street food worth the flight alone. The gateway to Southeast Asia.",
    bestTime: "Nov – Feb",
    costLevel: 1,
    suggestedDays: 4,
    tags: ["food", "temples", "city", "budget"],
    highlights: ["Grand Palace & Wat Pho", "Chatuchak weekend market", "Chao Phraya boat ride", "Yaowarat street food"],
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    icon: "flower",
    region: "Asia",
    blurb:
      "Rice terraces, surf breaks, and temple ceremonies. Pick a coast or go inland to Ubud — either way, ease off the gas.",
    bestTime: "Apr – Oct",
    costLevel: 1,
    suggestedDays: 7,
    tags: ["beach", "wellness", "surf", "nature"],
    highlights: ["Tegallalang rice terraces", "Uluwatu cliff temple", "Sunrise at Mount Batur", "Canggu surf lesson"],
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    icon: "tram",
    region: "Europe",
    blurb:
      "Tiled facades, miradouro sunsets, and custard tarts that ruin all other pastries. Europe's most easygoing capital.",
    bestTime: "Mar – Jun, Sep – Oct",
    costLevel: 2,
    suggestedDays: 4,
    tags: ["city", "food", "coast", "history"],
    highlights: ["Alfama by tram 28", "Pastéis de Belém", "Day trip to Sintra", "LX Factory"],
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    icon: "landmark",
    region: "Europe",
    blurb:
      "An open-air museum where every espresso comes with 2,000 years of history. Come hungry.",
    bestTime: "Apr – Jun, Sep – Oct",
    costLevel: 2,
    suggestedDays: 4,
    tags: ["history", "food", "art", "city"],
    highlights: ["Colosseum & Forum", "Vatican Museums early entry", "Trastevere dinner", "Pantheon at opening"],
  },
  {
    id: "queenstown",
    name: "Queenstown",
    country: "New Zealand",
    icon: "mountain-snow",
    region: "Oceania",
    blurb:
      "The adventure capital of the southern hemisphere, ringed by mountains that look computer-generated.",
    bestTime: "Dec – Feb (summer), Jun – Aug (ski)",
    costLevel: 3,
    suggestedDays: 5,
    tags: ["adventure", "mountains", "nature", "bucket list"],
    highlights: ["Milford Sound day trip", "Bungy at Kawarau Bridge", "Skyline gondola", "Glenorchy drive"],
  },
];

export const COST_LABELS: Record<1 | 2 | 3, string> = {
  1: "$ · budget-friendly",
  2: "$$ · moderate",
  3: "$$$ · splurge",
};
