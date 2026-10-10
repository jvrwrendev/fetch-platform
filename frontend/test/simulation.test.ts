import assert from "node:assert/strict"
import test from "node:test"

import type { Booking, GeoPoint, TripStatus } from "../../shared/src/types.ts"
import {
  PICKUP_LEG_MS,
  TRIP_LEG_MS,
  etaLabel,
  isTerminal,
  markerProgress,
  riderMarker,
  riderOrigin,
} from "../src/services/trip.ts"

const T0 = Date.UTC(2026, 0, 1, 8, 0, 0)
const iso = (ms: number) => new Date(ms).toISOString()

const PICKUP: GeoPoint = { name: "Pickup", address: "A", lat: 8.15, lng: 125.13 }
const DROPOFF: GeoPoint = { name: "Drop-off", address: "B", lat: 7.91, lng: 125.09 }

function booking(overrides: Partial<Booking> = {}): Booking {
  return {
    createdAt: iso(T0),
    pickup: PICKUP,
    dropoff: DROPOFF,
    status: "searching" as TripStatus,
    ...overrides,
  } as Booking
}

test("isTerminal is true only for completed and cancelled", () => {
  assert.equal(isTerminal("completed"), true)
  assert.equal(isTerminal("cancelled"), true)
  for (const open of ["searching", "accepted", "arriving", "in_progress"] as const) {
    assert.equal(isTerminal(open), false)
  }
})

test("riderOrigin offsets the pickup and labels the marker", () => {
  const origin = riderOrigin(PICKUP)
  assert.equal(origin.name, "Rider")
  assert.equal(origin.address, "Nearby")
  assert.equal(origin.lat, PICKUP.lat + 0.012)
  assert.equal(origin.lng, PICKUP.lng - 0.01)
})

test("the marker does not move while a request is searching", () => {
  const ride = booking({ status: "searching" })
  assert.equal(markerProgress(ride, T0), 0)
  assert.equal(riderMarker(ride, T0), null)
})

test("accepted eases up the pickup leg from when the rider accepted", () => {
  const ride = booking({ status: "accepted", acceptedAt: iso(T0) })
  assert.equal(markerProgress(ride, T0), 0)
  // Half the pickup leg in, 60% of the way up the leg at most.
  assert.equal(markerProgress(ride, T0 + PICKUP_LEG_MS / 2), 0.3)
  assert.equal(markerProgress(ride, T0 + PICKUP_LEG_MS), 0.6)
  // Past the expected duration it holds, rather than overshooting.
  assert.equal(markerProgress(ride, T0 + PICKUP_LEG_MS * 5), 0.6)
})

test("arriving never falls back below the accepted marker", () => {
  const ride = booking({ status: "arriving", acceptedAt: iso(T0) })
  assert.equal(markerProgress(ride, T0), 0.6)
  assert.equal(markerProgress(ride, T0 + PICKUP_LEG_MS), 1)
})

test("in_progress runs the drop-off leg from when the trip started", () => {
  const ride = booking({ status: "in_progress", startedAt: iso(T0) })
  assert.equal(markerProgress(ride, T0), 0)
  assert.equal(markerProgress(ride, T0 + TRIP_LEG_MS / 2), 0.5)
  assert.equal(markerProgress(ride, T0 + TRIP_LEG_MS), 1)
})

test("a completed trip parks the marker at the drop-off", () => {
  const ride = booking({ status: "completed" })
  assert.equal(markerProgress(ride, T0), 1)
  const marker = riderMarker(ride, T0)
  assert.deepEqual(marker, { lat: DROPOFF.lat, lng: DROPOFF.lng })
})

test("riderMarker follows the pickup leg, then the trip leg", () => {
  const near = booking({ status: "accepted", acceptedAt: iso(T0) })
  const enRoute = booking({ status: "in_progress", startedAt: iso(T0) })

  const atPickup = riderMarker(near, T0 + PICKUP_LEG_MS)
  assert.ok(atPickup)
  // 60% of the way from the rider's origin down to the pickup: closer than
  // the origin, but not there yet.
  assert.ok(atPickup.lat < riderOrigin(PICKUP).lat)
  assert.ok(atPickup.lat > PICKUP.lat)

  const midTrip = riderMarker(enRoute, T0 + TRIP_LEG_MS / 2)
  assert.ok(midTrip)
  assert.ok(Math.abs(midTrip.lat - (PICKUP.lat + DROPOFF.lat) / 2) < 1e-9)
})

test("etaLabel speaks to the passenger, one line per status", () => {
  assert.equal(etaLabel("searching"), "Finding a rider…")
  assert.equal(etaLabel("accepted"), "Rider accepted your request")
  assert.equal(etaLabel("arriving"), "Rider is arriving")
  assert.equal(etaLabel("in_progress"), "On the way to the drop-off")
  assert.equal(etaLabel("completed"), "Trip completed")
  assert.equal(etaLabel("cancelled"), "Trip cancelled")
})
