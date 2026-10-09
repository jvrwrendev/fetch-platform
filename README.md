# FETCH Platform

A ride-hailing platform, rebuilt as a workspace monorepo: one shared domain core,
one Expo app for passengers, riders **and** admins, and a skeleton for the
backend that isn't written yet.

**This build is mock-only.** There is no server and no database — every screen
reads from the shared mock world in `shared/` and the ride lifecycle is
simulated on the client. See [`backend/README.md`](./backend/README.md).

## Layout

| Path | What it is |
| --- | --- |
| `shared/` | The single source of truth: domain types, the fare engine, geo helpers, and the mock world. Consumed by the app. |
| `frontend/` | The Expo app (Expo Router + NativeWind + shadcn-style components) — passenger, rider and admin experiences, for a phone or the browser. |
| `backend/` | A skeleton: the module/config/database/middleware/routes tree a real service would grow into. No service runs yet. |

`shared` and `backend` are npm workspaces. `frontend/` installs on its own so the
Expo bundle gets its own React Native dependency tree, isolated from the web
workspace (two Reacts in one Metro bundle is the "Invalid hook call" crash).
Metro still watches `../shared`, so the phone bundles the same fare engine and
mock data every experience uses.

## Frontend structure

```
frontend/
├── app/                     # Expo Router routes (thin re-exports)
│   ├── index.tsx            #   landing
│   ├── login.tsx            #   demo sign-in
│   ├── passenger/           #   dashboard/services/booking/tracking/history/profile
│   ├── rider/               #   dashboard/services/active-trip/history/profile
│   └── admin/               #   dashboard/users/passengers/riders/services/bookings/reports/settings
└── src/
    ├── components/          #   shadcn-style UI + MapView/ServiceCard/BookingCard/…
    ├── features/            #   passenger/ rider/ admin/ implementations per domain
    ├── data/mock/           #   thin facades over @fetch/shared
    ├── services/            #   api/ (interfaces) + mock/ + maps/
    ├── store/               #   AuthContext, BookingsContext
    ├── navigation/          #   typed route map
    ├── hooks/  types/  theme/  utils/
```

Route files in `app/` are one-line shims; the real screens live under
`src/features/<role>/<domain>/screens/`. The mock service layer
(`src/services/api` interfaces + `src/services/mock` implementations) is the seam
a real backend would replace.

## Quick start

```bash
npm run install:all        # installs root workspaces + frontend/

# Expo app
npm run dev:mobile         # Metro; press w for web, a for Android
npm run dev:mobile:web     # straight to the browser
```

Builds / checks:

```bash
npm run build:mobile        # expo export --platform web  -> frontend/dist
npm run typecheck:mobile    # tsc --noEmit (frontend)
npm run typecheck:backend   # tsc --noEmit (backend skeleton)
```

## The one rule

Anything that decides money — the tariff floor, the per-vehicle base and per-km
rates, the surge multiplier, the booking fee — lives in
[`shared/src/fare.ts`](./shared/src/fare.ts) and is imported, never copied. The
admin fare editor and the passenger app's quote both go through `estimateFare` /
`quoteFare`, so a rate change has one definition.

## What's in the app

- **Passenger** — landing page, demo sign-in, book a ride (pickup → drop-off →
  review), live trip with an animated rider marker, ETA, cancellation, receipt
  and a star rating, plus a ride-type catalog, trip history and profile.
- **Rider** — go online, see open requests, accept/decline, advance a trip
  through its stages, earnings and history.
- **Admin** — dashboard stats, users, passengers, riders, fare rates, bookings,
  reports and settings, all reading the same mock world.
- **Live simulation** — a booking is driven by the clock: `searching →
  accepted → arriving → in_progress → completed`, with the rider marker moving
  along the route. No second device or tab is required to demo a full ride.

## Notes & limitations

- The admin console is folded into the Expo app, so it is a mobile-style UI
  (cards and lists) rather than the desktop tables/charts the old Vite app had.
- Fare-rate edits in the admin screens update the in-memory mock store; because
  there is no backend they do not persist across reloads.
- The native map uses `react-native-maps` (bundled with Expo Go). The web export
  draws the route and markers as SVG so the browser demo still works.
- `frontend/` targets Expo SDK 53. Expo Go on the app stores tracks the latest
  SDK, so use `npx expo start --web`, a development build
  (`npx expo run:android`), or an SDK-matching Expo Go to open it natively.
