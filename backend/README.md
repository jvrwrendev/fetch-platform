# FETCH backend (stub)

This directory is a placeholder. **The current build is mock-only** — there is no
server, no database, and no network calls to a FETCH API. Every screen reads from
the shared mock world in [`shared/src/mock`](../shared/src/mock) and the ride
lifecycle is simulated on the client (see
[`frontend/src/services/mock/simulation.ts`](../frontend/src/services/mock/simulation.ts)).

It exists so the repository already has the `frontend/ + backend/` shape a real
deployment would take, without pretending a service is running.

## What a real backend would own

| Concern | Would replace |
| --- | --- |
| Auth (email OTP or similar) | the demo account picker in `frontend/app/login.tsx` |
| Bookings + trip lifecycle | `BookingsContext` and the clock-driven simulation |
| Fare config + quoting | the **same** `shared/src/fare.ts` engine, run server-side |
| Maps / routing / geocoding | `frontend/src/services/maps/routing.ts` (OSRM demo today) |
| Payments | the `PaymentMethod` enum's mocked `cash` / `gcash` / `maya` |

The fare arithmetic must stay shared: the phone, the browser, and the server
should all import `shared/src/fare.ts` rather than re-implement it.

## Environment

See [`.env.example`](./.env.example) for the variables a real service would read.
None of them are required to run the mock build.
