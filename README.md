# FETCH Platform

A ride-hailing platform for Bukidnon, rebuilt as a workspace monorepo: one
shared domain core, an Expo app for passengers and riders, a Vite web console
for admins, and a **live Convex backend**.

**Connected.** Bookings, chat and notifications run against a real Convex
deployment, so a request made in the passenger app shows up in the rider app
and the admin console in real time. `shared/` stays the domain source of truth
(types, fare engine, geo helpers), and the mock world is seeded into the
database rather than hard-coded into the screens. The `backend/` folder is still
the placeholder for a conventional HTTP service — it is not what the apps talk
to. See [`backend/README.md`](./backend/README.md).

## Layout

| Path | What it is |
| --- | --- |
| `shared/` | The single source of truth: domain types, the fare engine, geo helpers, and the seed world. Consumed by every app. |
| `frontend/` | The Expo app (Expo Router + NativeWind + shadcn-style components) — passenger and rider, for a phone or the browser — plus `frontend/convex/`, the live backend. |
| `admin/` | The web admin console (Vite + React + shadcn-style UI) — desktop tables, charts and the Leaflet live map, reading the same deployment. Browser only. |
| `backend/` | A skeleton: the module/config/database/middleware/routes tree a real HTTP service would grow into. No service runs yet. |

`shared`, `backend` and `admin` are npm workspaces. `frontend/` installs on its
own so the Expo bundle gets its own React Native dependency tree, isolated from
the web workspace (two Reacts in one Metro bundle is the "Invalid hook call"
crash). Metro still watches `../shared`, so the phone bundles the same fare
engine and mock data every experience uses.

## Frontend structure

```
frontend/
├── app/                     # Expo Router routes (thin re-exports)
│   ├── index.tsx            #   landing
│   ├── login.tsx            #   demo sign-in
│   ├── passenger/           #   dashboard/booking/tracking/history/profile
│   └── rider/               #   dashboard/services/active-trip/history/profile
└── src/
    ├── components/          #   shadcn-style UI + MapView/ServiceCard/BookingCard/…
    ├── features/            #   passenger/ rider/ implementations per domain
    ├── services/            #   convex client + maps/ + trip progress
    ├── store/               #   AuthContext, BookingsContext, ChatsContext, …
    ├── navigation/          #   typed route map
    ├── hooks/  types/  theme/  utils/
```

Route files in `app/` are one-line shims; the real screens live under
`src/features/<role>/<domain>/screens/`. Screens read their data from the Convex
stores in `src/store` (`frontend/convex/` holds the backend), and the trip
marker's maths lives in `src/services/trip.ts`.

## Quick start

```bash
npm run install:all        # installs root workspaces + frontend/

# Convex backend (once): copy frontend/.env.example -> frontend/.env.local,
# fill in CONVEX_DEPLOY_KEY + EXPO_PUBLIC_CONVEX_URL, then push:
npm --prefix frontend exec convex dev --once
npm --prefix frontend exec convex run seed:reset   # load the demo world

# Expo app (passenger + rider)
npm run dev:mobile         # Metro; press w for web, a for Android
npm run dev:mobile:web     # straight to the browser

# Web admin console (copy admin/.env.example -> admin/.env.local first)
npm run dev:admin          # Vite dev server -> http://localhost:5173
```

Builds / checks:

```bash
npm run build:admin         # tsc && vite build  -> admin/dist
npm run build:mobile        # expo export --platform web  -> frontend/dist
npm run typecheck:admin     # tsc --noEmit (admin)
npm run typecheck:mobile    # tsc --noEmit (frontend)
npm run typecheck:backend   # tsc --noEmit (backend skeleton)
npm test                    # shared fare engine + ride simulation
```

## The one rule

Anything that decides money — the tariff floor, the per-vehicle base and per-km
rates, the surge multiplier, the booking fee — lives in
[`shared/src/fare.ts`](./shared/src/fare.ts) and is imported, never copied. The
admin fare editor and the passenger app's quote both go through `estimateFare` /
`quoteFare`, so a rate change has one definition.

## What's in the app

- **Passenger** — landing page, demo sign-in, and one booking flow that opens
  with a service choice: **Book ride**, **Pabili** (buy it for me) or **Pasugo**
  (pick it up and deliver it). Fares are motorcycle-only and settle by **Cash**
  or **E-Wallet**. Each service runs the same live trip (`searching →
  accepted → arriving → in_progress → completed`) with an animated rider
  marker, ETA, cancellation, receipt and a star rating, plus trip history and
  savings (notifications, default payment, saved places, service area,
  appearance) under the header account menu. Pabili and Pasugo are the local
  errands: the rider shops or collects on the passenger's behalf and the receipt
  carries the shopping list and, for Pasugo, the recipient.
- **Rider** — go online, see open requests, accept/decline, advance a trip
  through its stages, earnings and history, plus settings (availability,
  notifications, vehicle, service area, appearance) under the account menu.
- **Top bar** — every tabbed screen carries the FETCH mark, a **notification bell**
  with an unread badge, and the **account avatar**. The avatar opens the account
  panel (identity + edit, notifications, default payment, saved places, service
  area, appearance, trips, chats, help, terms/privacy, sign out); the bell opens
  the notification list.
- **Chats** — a tab on both sides. Each trip has a message thread with the other
  party, opened from the list or a "Message rider/passenger" button on the live
  trip.
- **Admin** (`admin/`, browser) — dashboard stats and charts, passengers, riders,
  bookings, fare rates, a Leaflet live map, reports, notifications, profile and
  settings, all reading the same mock world.
- **Live simulation** — a booking is driven by the clock: `searching →
  accepted → arriving → in_progress → completed`, with the rider marker moving
  along the route. No second device or tab is required to demo a full ride.
- **Service area** — FETCH is Bukidnon-based. Riders are live in **Malaybalay
  City** and **Valencia City** (12 km around each); the map opens on the
  province and the other municipalities are listed as "coming next". Booking a
  point outside the two cities shows a notice rather than dead-ending.

## Notes & limitations

- The admin console is a separate web app (`admin/`), so the Expo app is
  passenger/rider only. Run it with `npm run dev:admin`.
- Fare-rate edits in the admin console update the in-memory mock store; because
  there is no backend they do not persist across reloads, and they are not shared
  with a running Expo session.
- The service area is advisory in this mock: an out-of-area pickup is flagged but
  still allowed, since there is no rider-matching backend to reject it.
- The native map uses `react-native-maps` (bundled with Expo Go). The web export
  draws the route and markers as SVG so the browser demo still works.
- `frontend/` targets Expo SDK 53. Expo Go on the app stores tracks the latest
  SDK, so use `npx expo start --web`, a development build
  (`npx expo run:android`), or an SDK-matching Expo Go to open it natively.
