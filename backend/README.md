# FETCH backend (skeleton)

This directory is a **skeleton**. The current build is mock-only — there is no
running server, no database, and no network calls to a FETCH API. Every screen
reads from the shared mock world in [`shared/src/mock`](../shared/src/mock) and
the ride lifecycle is simulated on the client (see
[`frontend/src/services/mock/simulation.ts`](../frontend/src/services/mock/simulation.ts)).

The tree exists so the repository already has the `frontend/ + backend/` shape a
real deployment would take, without pretending a service is running. Nothing here
is imported by the app.

## Layout

```
backend/
├── src/
│   ├── modules/            # one folder per domain
│   │   ├── passengers/     #   <domain>.controller.ts  HTTP handlers
│   │   ├── riders/         #   <domain>.service.ts     business logic
│   │   ├── admins/         #   <domain>.routes.ts      route table
│   │   ├── users/          #   <domain>.types.ts       DTOs
│   │   ├── services/       #   index.ts                public surface
│   │   ├── bookings/
│   │   └── reports/
│   ├── config/             # environment-driven config
│   ├── database/           # connection + repositories (placeholder)
│   ├── middleware/         # auth / error handlers (placeholder)
│   ├── routes/             # assembles every module's route table
│   └── server.ts           # entry point (does not listen yet)
├── tests/                  # placeholder tests
├── .env.example
├── package.json
└── tsconfig.json
```

## What a real backend would own

| Concern | Would replace |
| --- | --- |
| Auth (email OTP or similar) | the demo account picker in `frontend/app/login.tsx` |
| Bookings + trip lifecycle | `store/BookingsContext` and the clock-driven simulation |
| Fare config + quoting | the **same** `shared/src/fare.ts` engine, run server-side |
| Maps / routing / geocoding | `frontend/src/services/maps/*` (OSRM demo today) |
| Payments | the `PaymentMethod` enum's mocked `cash` / `gcash` / `maya` |

The fare arithmetic must stay shared: the phone, the browser, and the server
should all import `shared/src/fare.ts` rather than re-implement it.

## Type checking

```sh
npm run typecheck -w backend
```

## Environment

See [`.env.example`](./.env.example) for the variables a real service would read.
None of them are required to run the mock build.
