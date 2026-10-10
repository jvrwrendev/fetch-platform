# FETCH mobile

The Expo app for FETCH — passenger and rider experiences in one codebase, on a
live Convex backend. Expo Router + NativeWind + shadcn-style components
(`react-native-reusables`). Data comes from the deployment in `frontend/convex/`
through the stores in `src/store`; `@fetch/shared` holds the domain types, the
fare engine and the seed world.

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
├── passenger/             #   dashboard · booking · tracking · history · chats · profile · settings
└── rider/                 #   dashboard · services · active-trip · history · chats · profile · settings
src/
├── components/            # shadcn-style UI + MapView, ServiceIcon, BookingCard, UserCard, StatCard, StatusBadge
├── features/              # passenger/ rider/ screen implementations, one folder per domain
├── services/              # convex/ (client) · maps/ (routing + geocoding) · trip.ts (marker maths)
├── store/                 # AuthContext, BookingsContext, ChatsContext, NotificationsContext, SettingsContext, ThemeContext
├── navigation/            # typed route map
├── hooks/ · types/ · theme/ · utils/
```

A route in `app/` is one line, e.g.:

```tsx
export { default } from "@/features/passenger/dashboard"
```

The implementation lives in `src/features/<role>/<domain>/screens/`. Screens read
their data from the Convex stores in `src/store`, which talk to the deployment in
`frontend/convex/`.

## Notes

- The native map uses `react-native-maps` (bundled with Expo Go); the web build
  draws an SVG map instead (`MapView.tsx` vs `MapView.native.tsx`).
- `src/types` and the `shared` package hold the domain model — edit the shared
  package, not a local copy.
- Targeted at Expo SDK 53. If Expo Go on the store has moved on, use
  `npm run web`, a development build (`npx expo run:android`), or an
  SDK-matching Expo Go.
