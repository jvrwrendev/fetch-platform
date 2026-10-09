# FETCH mobile

The Expo app for FETCH — passenger, rider and admin experiences in one
codebase. Expo Router + NativeWind + shadcn-style components
(`react-native-reusables`). **Mock-only**: no backend, no real payments. All data
comes from `@fetch/shared` through the facades in `src/data/mock`.

## Run

From the repo root:

```bash
npm run install:all        # first time — installs shared + frontend
npm run dev:mobile         # Metro; press w for web, a for Android
npm run dev:mobile:web     # straight to the browser
```

Or from this folder:

```bash
npm install
npm run start              # expo start
npm run web                # expo start --web
```

## Checks

```bash
npm run typecheck          # tsc --noEmit
npm run export:web         # expo export --platform web  -> dist/
```

## Structure

```
app/                       # Expo Router routes — thin re-exports only
├── index.tsx              #   landing
├── login.tsx              #   demo sign-in
├── passenger/             #   dashboard · services · booking · tracking · history · profile
├── rider/                 #   dashboard · services · active-trip · history · profile
└── admin/                 #   dashboard · users · passengers · riders · services · bookings · reports · settings
src/
├── components/            # shadcn-style UI + MapView, ServiceCard, BookingCard, UserCard, StatCard, StatusBadge
├── features/              # passenger/ rider/ admin/ screen implementations, one folder per domain
├── data/mock/             # thin facades over @fetch/shared (users, bookings, reports, …)
├── services/              # api/ (interfaces) · mock/ (implementations) · maps/ (routing + geocoding)
├── store/                 # AuthContext, BookingsContext
├── navigation/            # typed route map
├── hooks/ · types/ · theme/ · utils/
```

A route in `app/` is one line, e.g.:

```tsx
export { default } from "@/features/passenger/dashboard"
```

The implementation lives in `src/features/<role>/<domain>/screens/`. Screens call
`src/services/api` interfaces; `src/services/mock` implements them over the shared
mock world. That is the seam to replace with a real backend.

## Notes

- The native map uses `react-native-maps` (bundled with Expo Go); the web build
  draws an SVG map instead (`MapView.tsx` vs `MapView.native.tsx`).
- `src/data/mock` and `src/types` re-export `@fetch/shared` — edit the shared
  package, not the facades.
- Targeted at Expo SDK 53. If Expo Go on the store has moved on, use
  `npm run web`, a development build (`npx expo run:android`), or an
  SDK-matching Expo Go.
