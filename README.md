# Thola 🧭

**Thola** (isiZulu: *to discover*) is an offline-first travel planner. Plan day-by-day
itineraries, track your budget, and pack with confidence — no account, no backend, no
tracking. Everything lives on your device.

## Features

- **Trips dashboard** — upcoming and past trips with live countdowns, plan counts, and
  spend at a glance.
- **Day-by-day itinerary** — every trip day gets its own timeline; add timed, categorized
  plans with notes (booking refs, addresses, reminders).
- **Budget tracking** — set a trip budget, log expenses by category, and watch the
  remaining balance with a progress bar and per-category breakdown.
- **Packing lists** — every trip starts with the essentials; add smart templates
  (beach, cold weather, hiking, city break, work trip) or your own items, and check
  things off as you pack.
- **Explore** — a curated catalog of destinations with best-time-to-go, cost level, and
  highlights. One tap turns a destination into a trip.
- **Your data is yours** — stored locally in the browser, with one-click JSON export and
  import for backups or moving devices.
- **Installable & offline** — a PWA with a service worker; add it to your home screen and
  it works in airplane mode (where you'll need it most).

## Getting started

```bash
npm install
npm run dev        # start the dev server
```

## Scripts

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                   |
| `npm test`          | Run the unit/component test suite (Vitest)  |
| `npm run typecheck` | TypeScript strict type checking             |
| `npm run build`     | Type-check and build the production bundle  |
| `npm run preview`   | Serve the production build locally          |

## Deploying

The build output in `dist/` is fully static and uses relative paths and hash-based
routing, so it deploys to any static host with zero configuration:

- **Netlify / Vercel** — point at the repo, build command `npm run build`, output `dist`.
- **GitHub Pages** — upload the `dist/` folder (the CI workflow already produces it as an
  artifact on every push).
- **Anywhere else** — copy `dist/` to any web server or CDN.

## Architecture

- **React 18 + TypeScript + Vite** — strict mode, no runtime dependencies beyond React.
- **State** — a single pure reducer (`src/store/reducer.ts`, fully unit-tested) wrapped in
  React context, persisted to `localStorage` with validation on load/import.
- **Routing** — a ~60-line hash router (`src/lib/router.ts`); no router dependency, works
  on any static host without rewrite rules.
- **Tests** — Vitest + Testing Library covering date math, money formatting, every reducer
  action, import sanitization, and end-to-end UI flows.

## License

MIT
