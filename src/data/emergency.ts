export interface EmergencyNumbers {
  country: string;
  police: string;
  ambulance: string;
  fire: string;
  notes?: string;
}

/** Emergency numbers by ISO 3166-1 alpha-2 country code (lowercase). */
const EMERGENCY_NUMBERS: Record<string, EmergencyNumbers> = {
  us: { country: "United States", police: "911", ambulance: "911", fire: "911" },
  ca: { country: "Canada", police: "911", ambulance: "911", fire: "911" },
  mx: { country: "Mexico", police: "911", ambulance: "911", fire: "911" },
  co: { country: "Colombia", police: "123", ambulance: "123", fire: "123" },
  pe: { country: "Peru", police: "105", ambulance: "106", fire: "116" },
  br: { country: "Brazil", police: "190", ambulance: "192", fire: "193" },
  ar: { country: "Argentina", police: "911", ambulance: "107", fire: "100" },
  cl: { country: "Chile", police: "133", ambulance: "131", fire: "132" },
  cr: { country: "Costa Rica", police: "911", ambulance: "911", fire: "911" },
  do: { country: "Dominican Republic", police: "911", ambulance: "911", fire: "911" },
  jm: { country: "Jamaica", police: "119", ambulance: "110", fire: "110" },
  gb: { country: "United Kingdom", police: "999", ambulance: "999", fire: "999", notes: "112 also works" },
  ie: { country: "Ireland", police: "112", ambulance: "112", fire: "112", notes: "999 also works" },
  fr: { country: "France", police: "17", ambulance: "15", fire: "18", notes: "112 works for all" },
  es: { country: "Spain", police: "091", ambulance: "061", fire: "080", notes: "112 works for all" },
  pt: { country: "Portugal", police: "112", ambulance: "112", fire: "112" },
  it: { country: "Italy", police: "113", ambulance: "118", fire: "115", notes: "112 works for all" },
  de: { country: "Germany", police: "110", ambulance: "112", fire: "112" },
  nl: { country: "Netherlands", police: "112", ambulance: "112", fire: "112" },
  ch: { country: "Switzerland", police: "117", ambulance: "144", fire: "118", notes: "112 works for all" },
  at: { country: "Austria", police: "133", ambulance: "144", fire: "122", notes: "112 works for all" },
  gr: { country: "Greece", police: "100", ambulance: "166", fire: "199", notes: "112 works for all" },
  tr: { country: "Türkiye", police: "112", ambulance: "112", fire: "112" },
  ma: { country: "Morocco", police: "19", ambulance: "15", fire: "15" },
  eg: { country: "Egypt", police: "122", ambulance: "123", fire: "180" },
  za: { country: "South Africa", police: "10111", ambulance: "10177", fire: "10177", notes: "112 from mobiles" },
  tz: { country: "Tanzania", police: "112", ambulance: "115", fire: "114" },
  ke: { country: "Kenya", police: "999", ambulance: "999", fire: "999", notes: "112 also works" },
  jp: { country: "Japan", police: "110", ambulance: "119", fire: "119" },
  kr: { country: "South Korea", police: "112", ambulance: "119", fire: "119" },
  cn: { country: "China", police: "110", ambulance: "120", fire: "119" },
  th: { country: "Thailand", police: "191", ambulance: "1669", fire: "199", notes: "Tourist police: 1155" },
  vn: { country: "Vietnam", police: "113", ambulance: "115", fire: "114" },
  id: { country: "Indonesia", police: "110", ambulance: "118", fire: "113" },
  my: { country: "Malaysia", police: "999", ambulance: "999", fire: "994" },
  sg: { country: "Singapore", police: "999", ambulance: "995", fire: "995" },
  ph: { country: "Philippines", police: "911", ambulance: "911", fire: "911" },
  in: { country: "India", police: "112", ambulance: "112", fire: "112" },
  ae: { country: "United Arab Emirates", police: "999", ambulance: "998", fire: "997" },
  au: { country: "Australia", police: "000", ambulance: "000", fire: "000", notes: "112 from mobiles" },
  nz: { country: "New Zealand", police: "111", ambulance: "111", fire: "111" },
};

export const EMERGENCY_FALLBACK: EmergencyNumbers = {
  country: "Most countries",
  police: "112",
  ambulance: "112",
  fire: "112",
  notes:
    "112 connects to emergency services in the EU and many other countries, and works from most mobile phones worldwide. 911 redirects in many countries too.",
};

export function getEmergencyNumbers(countryCode?: string): EmergencyNumbers {
  if (countryCode) {
    const found = EMERGENCY_NUMBERS[countryCode.toLowerCase()];
    if (found) return found;
  }
  return EMERGENCY_FALLBACK;
}
