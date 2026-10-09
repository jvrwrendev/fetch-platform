# FETCH Platform

A ride-hailing platform, rebuilt as a workspace monorepo: one shared domain core,
a React Native (Expo) app, a web admin console, and a stub for the backend that
isn't written yet.

**This build is mock-only.** There is no server and no database — every screen
reads from the shared mock world in `shared/` and the ride lifecycle is
simulated on the client. See [`backend/README.md`](./backend/README.md).

## Layout

| Path | What it is |
| --- | --- |
| `shared/` | The single source of truth: domain types, the fare engine, geo helpers, and the mock world. Consumed by both apps. |
| `frontend/` | The Expo app (Expo Router + NativeWind + shadcn-style components), for a phone or the browser. |
| `admin/` | The web admin console (Vite + React + shadcn/ui). Edits fare rates here. |
| `backend/` | A stub: README + `.env.example`. No service yet. |

`shared` and `admin` are npm workspaces. `frontend/` installs on its own so the
Expo bundle gets its own React Native dependency tree, isolated from the web
workspace (two Reacts in one Metro bundle is the "Invalid hook call" crash).
Metro still watches `../shared`, so the phone bundles the same fare engine and
mock data the browser and admin console do.

## Quick start

```bash
npm run install:all        # installs roots workspaces + frontend/

# admin console (Vite, http://localhost:5173)
npm run dev:admin

# Expo app
npm run dev:mobile         # Metro; press w for web, a for Android
npm run dev:mobile:web     # straight to the browser
```

Builds / checks:

```bash
npm run build:admin        # tsc && vite build
npm run build:mobile       # expo export --platform web  -> frontend/dist
npm run typecheck:mobile   # tsc --noEmit
```

## The one rule

Anything that decides money — the tariff floor, the per-vehicle base and per-km
rates, the surge multiplier, the booking fee — lives in
[`shared/src/fare.ts`](./shared/src/fare.ts) and is imported, never copied. The
admin console's fare editor and the passenger app's quote both go through
`estimateFare` / `quoteFare`, so a rate change has one definition.

## What's in the app

- **Passenger** — landing page, demo sign-in, book a ride (pickup → drop-off →
  review), live trip with an animated rider marker, ETA, cancellation, receipt
  and a star rating, plus trip history and profile.
- **Rider** — go online, see open requests, accept/decline, advance a trip
  through its stages, earnings and history.
- **Live simulation** — a booking is driven by the clock: `searching →
  accepted → arriving → in_progress → completed`, with the rider marker moving
  along the route. No second device or tab is required to demo a full ride.

## Notes & limitations

- Fare-rate edits in the admin console do **not** reach the phone at runtime:
  browsers scope `localStorage` per origin and the phone has its own store.
  `shared/` is the single *definition*; wiring a live write path is the
  backend's job.
- The native map uses `react-native-maps` (bundled with Expo Go). The web export
  draws the route and markers as SVG so the browser demo still works.
- `frontend/` targets Expo SDK 53. Expo Go on the app stores tracks the latest
  SDK, so use `npx expo start --web`, a development build
  (`npx expo run:android`), or an SDK-matching Expo Go to open it natively.
