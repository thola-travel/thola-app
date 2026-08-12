/**
 * Icon set for the Desire Discovery Quiz.
 *
 * Hand-drawn line icons on a 24x24 grid, all sharing one style: 1.8 stroke,
 * round caps and joins, currentColor. Each entry is the inner markup of an
 * SVG; render through the icon() helper in app.js so every instance carries
 * identical attributes.
 */

const ICONS = {
  /* ---- categories ---- */
  dominance: '<path d="M4 16.5V8l4.5 3.5L12 6l3.5 5.5L20 8v8.5H4z"/>',
  submission: '<path d="M5 13a7 7 0 0 0 14 0"/><path d="M12 3v8"/><path d="M9.5 8.5 12 11l2.5-2.5"/>',
  bondage: '<circle cx="8.5" cy="14" r="3.5"/><circle cx="15.5" cy="10" r="3.5"/>',
  sensation: '<path d="M12 4l1.6 6.4L20 12l-6.4 1.6L12 20l-1.6-6.4L4 12l6.4-1.6z"/>',
  sadism: '<path d="M12 19C6.5 14.8 4 11.9 4 9.1 4 7 5.6 5.4 7.7 5.4c1.7 0 3.2 1 4.3 2.6 1.1-1.6 2.6-2.6 4.3-2.6 2.1 0 3.7 1.6 3.7 3.7 0 2.8-2.5 5.7-8 9.9z"/><path d="M12.9 7.8 10.9 11.2h2.4L11.3 14.6"/>',
  masochism: '<path d="M12 19C6.5 14.8 4 11.9 4 9.1 4 7 5.6 5.4 7.7 5.4c1.7 0 3.2 1 4.3 2.6 1.1-1.6 2.6-2.6 4.3-2.6 2.1 0 3.7 1.6 3.7 3.7 0 2.8-2.5 5.7-8 9.9z"/><path d="M5.5 18.5 18.5 5.5"/><path d="M15.5 5.5h3v3"/>',
  roleplay: '<path d="M6 5h12v6.5a6 6 0 0 1-12 0z"/><circle cx="9.5" cy="9" r=".4" fill="currentColor"/><circle cx="14.5" cy="9" r=".4" fill="currentColor"/><path d="M9.5 12.5c.8.8 4.2.8 5 0"/>',
  exhibition: '<circle cx="12" cy="12" r="2.6"/><path d="M12 3.5V6M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18"/>',
  voyeurism: '<path d="M3 12c3.5-5.5 14.5-5.5 18 0-3.5 5.5-14.5 5.5-18 0z"/><circle cx="12" cy="12" r="2.6"/>',
  praise: '<path d="M12 19C6.5 14.8 4 11.9 4 9.1 4 7 5.6 5.4 7.7 5.4c1.7 0 3.2 1 4.3 2.6 1.1-1.6 2.6-2.6 4.3-2.6 2.1 0 3.7 1.6 3.7 3.7 0 2.8-2.5 5.7-8 9.9z"/>',
  sensual: '<circle cx="9.5" cy="12" r="4.2"/><circle cx="14.5" cy="12" r="4.2"/>',
  switchplay: '<path d="M6.5 9A6.5 6.5 0 0 1 18 7.5"/><path d="M18 4v3.5h-3.5"/><path d="M17.5 15A6.5 6.5 0 0 1 6 16.5"/><path d="M6 20v-3.5h3.5"/>',
  bratplay: '<path d="M5 5h14v10H10l-4 4v-4H5z"/><path d="M9 10c1-1.2 2-1.2 3 0s2 1.2 3 0"/>',
  discipline: '<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 9h6M9 12.5h6M9 16h4"/>',
  primal: '<circle cx="8" cy="9" r="1.2"/><circle cx="12" cy="7.6" r="1.2"/><circle cx="16" cy="9" r="1.2"/><path d="M8.2 16.8c0-2.4 1.7-4.1 3.8-4.1s3.8 1.7 3.8 4.1c0 1.5-1.2 2.5-2.4 2.1a4.6 4.6 0 0 0-2.8 0c-1.2.4-2.4-.6-2.4-2.1z"/>',
  cnc: '<rect x="4" y="9" width="16" height="10" rx="1.5"/><path d="M4 9l1.8-4H20l-1.8 4"/><path d="M9.5 5 8 9M14.5 5 13 9"/>',
  petplay: '<circle cx="12" cy="10" r="6"/><circle cx="12" cy="17.8" r="1.7"/>',
  caregiver: '<path d="M12 4l7 2.8V12c0 4.3-3 7.3-7 8.6-4-1.3-7-4.3-7-8.6V6.8z"/><path d="M12 14.8c-2.2-1.7-3.2-2.9-3.2-4 0-.9.7-1.6 1.6-1.6.6 0 1.2.4 1.6 1 .4-.6 1-1 1.6-1 .9 0 1.6.7 1.6 1.6 0 1.1-1 2.3-3.2 4z"/>',
  orgasmcontrol: '<path d="M7 4h10l-5 8-5-8z"/><path d="M7 20h10l-5-8-5 8z"/>',
  rope: '<path d="M4 14c3-6 8 2 11-4"/><path d="M20 10c-3 6-8-2-11 4"/>',
  sensorydep: '<path d="M5 14v-1a7 7 0 0 1 14 0v1"/><rect x="4" y="14" width="3.4" height="5" rx="1.4"/><rect x="16.6" y="14" width="3.4" height="5" rx="1.4"/>',
  impact: '<circle cx="9.5" cy="14.5" r="2.4"/><path d="M13.5 10.5 16.5 7.5M14.8 14.5h3.7M13.5 18.5l3 3M9.5 8.3V4.8"/>',
  temperature: '<path d="M10.5 13.2V5a1.5 1.5 0 0 1 3 0v8.2a3.6 3.6 0 1 1-3 0z"/><path d="M12 10v6.5"/>',
  tickling: '<path d="M7 17C7 10.5 12.5 5 19 5c0 6.5-5.5 12-12 12z"/><path d="M7 17 15 9"/><path d="M5 19l2-2"/>',
  electro: '<path d="M13 3 6 13.5h5L9.5 21 18 10.5h-5z"/>',
  marking: '<path d="M6 5c2.5 3.5 4 7.5 4.5 12"/><path d="M11 4c2 3.5 3.2 7.5 3.5 12"/><path d="M16 5c1.5 3 2.3 6.5 2.5 10"/>',
  edgeplay: '<path d="M4 18 9 8l3 5 3-6 5 11z"/>',
  costumes: '<path d="M12 6.5c0-1.3 1-2.3 2.2-2.1"/><path d="M12 6.5 4.5 15a1.8 1.8 0 0 0 1.4 3h12.2a1.8 1.8 0 0 0 1.4-3z"/>',
  authority: '<path d="M4 9 12 4l8 5"/><path d="M5 9h14"/><path d="M7 12v5M12 12v5M17 12v5"/><path d="M4 20h16"/>',
  fantasy: '<path d="M4 20 14 10"/><path d="M16.5 5.5 17.3 7.7 19.5 8.5 17.3 9.3 16.5 11.5 15.7 9.3 13.5 8.5 15.7 7.7z"/>',
  genderplay: '<path d="M12 6v13"/><path d="M12 10c-1.5-3-5-4.5-7-3-1.8 1.4-.8 5 2 6-2.8 1-3.8 4.6-2 6 2 1.5 5.5 0 7-3"/><path d="M12 10c1.5-3 5-4.5 7-3 1.8 1.4.8 5-2 6 2.8 1 3.8 4.6 2 6-2 1.5-5.5 0-7-3"/>',
  medical: '<circle cx="12" cy="12" r="7.5"/><path d="M12 8.5v7M8.5 12h7"/>',
  sizeplay: '<path d="M14 4h6v6"/><path d="M20 4l-6.5 6.5"/><path d="M10 20H4v-6"/><path d="M4 20l6.5-6.5"/>',
  breeding: '<path d="M12 20V6"/><path d="M12 10c-2.5 0-4-1.3-4.2-3.6C10.3 6.6 11.8 7.8 12 10z"/><path d="M12 10c2.5 0 4-1.3 4.2-3.6C13.7 6.6 12.2 7.8 12 10z"/><path d="M12 14c-2.5 0-4-1.3-4.2-3.6 2.5.2 4 1.4 4.2 3.6z"/><path d="M12 14c2.5 0 4-1.3 4.2-3.6-2.5.2-4 1.4-4.2 3.6z"/>',
  hypno: '<path d="M12 12.2c.9-.1 1.4.9.8 1.5-.9.9-2.5.2-2.7-1.1-.3-1.9 1.7-3.2 3.5-2.6 2.4.7 3 3.7 1.3 5.5-2.1 2.2-5.9 1.3-7.2-1.5-1.6-3.4.9-7.2 4.7-7.5 4.4-.4 7.8 3.6 6.9 7.9"/>',
  filming: '<rect x="3.5" y="7" width="12" height="10" rx="2"/><path d="M15.5 11 20 8.5v7L15.5 13"/>',
  groupplay: '<circle cx="12" cy="6.5" r="2.2"/><circle cx="6.5" cy="16.5" r="2.2"/><circle cx="17.5" cy="16.5" r="2.2"/><path d="M10.8 8.4 7.7 14.6M13.2 8.4l3.1 6.2M8.7 16.5h6.6"/>',
  compersion: '<path d="M9 16.5C5.4 13.7 3.6 11.6 3.6 9.6 3.6 8 4.8 6.8 6.4 6.8c1.1 0 2 .6 2.6 1.6.6-1 1.5-1.6 2.6-1.6 1.6 0 2.8 1.2 2.8 2.8 0 2-1.8 4.1-5.4 6.9z"/><path d="M16.5 19c-2.4-1.9-3.6-3.3-3.6-4.6 0-1 .8-1.9 1.9-1.9.7 0 1.3.4 1.7 1 .4-.6 1-1 1.7-1 1.1 0 1.9.9 1.9 1.9 0 1.3-1.2 2.7-3.6 4.6z"/>',
  materials: '<rect x="5" y="5" width="14" height="14" rx="2.5"/><rect x="8.2" y="8.2" width="7.6" height="7.6" rx="1.2" stroke-dasharray="2.4 2.2"/>',
  lingerie: '<circle cx="12" cy="12" r="1.6"/><path d="M10.5 11.2 4.5 7.8v8.4l6-3.4"/><path d="M13.5 11.2l6-3.4v8.4l-6-3.4"/>',
  feet: '<ellipse cx="11.5" cy="14.5" rx="3.4" ry="5"/><circle cx="8.7" cy="6.8" r=".9"/><circle cx="11.4" cy="5.9" r=".9"/><circle cx="14.1" cy="6.3" r=".9"/><circle cx="16.3" cy="7.7" r=".9"/>',
  bodyworship: '<circle cx="12" cy="6" r="2.4"/><path d="M9.5 15.5c0-2.3 1-3.8 2.5-3.8s2.5 1.5 2.5 3.8"/><path d="M8.5 20v-4.5h7V20"/><path d="M6.5 20h11"/>',
  nichebody: '<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16"/><circle cx="12" cy="12" r="3"/>',
  wetmessy: '<path d="M12 4c3.2 4.6 5 7.4 5 9.7a5 5 0 0 1-10 0C7 11.4 8.8 8.6 12 4z"/><circle cx="18.8" cy="6.4" r=".9"/><circle cx="5.2" cy="8.2" r=".9"/>',
  watersports: '<path d="M12 5c2.9 4 4.4 6.5 4.4 8.6a4.4 4.4 0 0 1-8.8 0C7.6 11.5 9.1 9 12 5z"/>',
  dirtytalk: '<rect x="9.4" y="4" width="5.2" height="9" rx="2.6"/><path d="M6.5 11.5a5.5 5.5 0 0 0 11 0"/><path d="M12 17v3"/>',
  degradation: '<path d="M5 5h14v10H10l-4 4v-4H5z"/><path d="M12 8v3.4"/><circle cx="12" cy="13.6" r=".4" fill="currentColor"/>',
  tantric: '<path d="M12 5c1.8 2.2 2.7 4.2 2.7 6a2.7 2.7 0 0 1-5.4 0c0-1.8.9-3.8 2.7-6z"/><path d="M5.5 10c2.4.4 4.2 1.5 5.2 3.4"/><path d="M18.5 10c-2.4.4-4.2 1.5-5.2 3.4"/><path d="M4.5 14.5C6.8 17 9.2 18.2 12 18.2s5.2-1.2 7.5-3.7"/>',
  sleepy: '<path d="M14.5 4a7.5 7.5 0 1 0 5.5 12.6A8.5 8.5 0 0 1 14.5 4z"/><path d="M5 5h3.2L5 8.4h3.2"/>',
  objects: '<ellipse cx="12" cy="9.5" rx="4.8" ry="5.8"/><path d="M11 15.6h2"/><path d="M12 15.6c-1 1-1 1.7 0 2.5s1 1.7 0 2.7"/>',

  /* ---- interface ---- */
  'ui-logo': '<path d="M12 4.5c2 2.4 3 4.6 3 6.6a3 3 0 0 1-6 0c0-2 1-4.2 3-6.6z"/><path d="M5 9.5c2.7.5 4.7 1.7 5.8 3.8"/><path d="M19 9.5c-2.7.5-4.7 1.7-5.8 3.8"/><path d="M4 14.8C6.5 17.6 9.2 19 12 19s5.5-1.4 8-4.2"/>',
  'ui-pulse': '<path d="M3 12h4l2.5-6 4 12L16 12h5"/>',
  'ui-mail': '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  'ui-list': '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4.2" cy="6" r=".9" fill="currentColor"/><circle cx="4.2" cy="12" r=".9" fill="currentColor"/><circle cx="4.2" cy="18" r=".9" fill="currentColor"/>',
  'ui-flame': '<path d="M12 4c.6 2.8 2.2 4.3 3.8 6 1.4 1.5 2.2 3 2.2 4.7A6 6 0 0 1 6 14.7c0-2.1 1.1-3.7 2.4-5.2.5.9 1 1.5 1.8 2C10 8.8 10.7 6.3 12 4z"/>',
  'ui-eye': '<path d="M3 12c3.5-5.5 14.5-5.5 18 0-3.5 5.5-14.5 5.5-18 0z"/><circle cx="12" cy="12" r="2.6"/>',
  'ui-dash': '<circle cx="12" cy="12" r="7.5"/><path d="M8.5 12h7"/>',
  'ui-x': '<circle cx="12" cy="12" r="7.5"/><path d="m9.5 9.5 5 5M14.5 9.5l-5 5"/>',
  'ui-compass': '<circle cx="12" cy="12" r="8"/><path d="m14.8 9.2-1.7 4-4 1.7 1.7-4z"/>',
  'ui-map': '<path d="M4 6.5 9 4.5l6 2 5-2v13l-5 2-6-2-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  'ui-sprout': '<path d="M12 20v-7"/><path d="M12 13c0-3.3-2.4-5.5-6-5.5 0 3.3 2.4 5.5 6 5.5z"/><path d="M12 11c0-2.9 2.1-4.8 5.5-4.8 0 2.9-2.1 4.8-5.5 4.8z"/>',
  'ui-scale': '<path d="M4 15h16"/><path d="M4 12.5v5M9.3 13.5v3M14.6 13.5v3M20 12.5v5"/>',
  'ui-heart': '<path d="M12 19C6.5 14.8 4 11.9 4 9.1 4 7 5.6 5.4 7.7 5.4c1.7 0 3.2 1 4.3 2.6 1.1-1.6 2.6-2.6 4.3-2.6 2.1 0 3.7 1.6 3.7 3.7 0 2.8-2.5 5.7-8 9.9z"/>',
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ICONS };
}
