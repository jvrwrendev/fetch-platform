import assert from "node:assert/strict"
import test from "node:test"

import type { Booking, GeoPoint } from "../../shared/src/types.ts"
import {
  ACCEPT_AT,
  ARRIVE_AT,
  DONE_AT,
  START_AT,
  etaSeconds,
  isTerminal,
  markerProgress,
  riderOrigin,
  statusAt,
} from "../src/services/mock/simulation.ts"

const CREATED_AT = Date.UTC(2026, 0, 1, 8, 0, 0)

function makeBooking(createdAt = CREATED_AT): Booking {
  return { createdAt: new Date(createdAt).toISOString() } as Booking
}

test("statusAt walks searching -> accepted -> arriving -> in_progress -> completed", () => {
  assert.equal(statusAt(0), "searching")
  assert.equal(statusAt(ACCEPT_AT - 1), "searching")
  assert.equal(statusAt(ACCEPT_AT), "accepted")
  assert.equal(statusAt(ARRIVE_AT - 1), "accepted")
  assert.equal(statusAt(ARRIVE_AT), "arriving")
  assert.equal(statusAt(START_AT - 1), "arriving")
  assert.equal(statusAt(START_AT), "in_progress")
  assert.equal(statusAt(DONE_AT - 1), "in_progress")
  assert.equal(statusAt(DONE_AT), "completed")
  assert.equal(statusAt(DONE_AT * 10), "completed")
})

test("isTerminal is true only for completed and cancelled", () => {
  assert.equal(isTerminal("completed"), true)
  assert.equal(isTerminal("cancelled"), true)
  assert.equal(isTerminal("searching"), false)
  assert.equal(isTerminal("accepted"), false)
  assert.equal(isTerminal("arriving"), false)
  assert.equal(isTerminal("in_progress"), false)
})

test("etaSeconds counts down to the next waypoint then stops at zero", () => {
  const booking = makeBooking()
  assert.equal(etaSeconds(booking, CREATED_AT), 3)
  assert.equal(etaSeconds(booking, CREATED_AT + 1500), 1)
  assert.equal(etaSeconds(booking, CREATED_AT + ACCEPT_AT), 7)
  assert.equal(etaSeconds(booking, CREATED_AT + START_AT), 8)
  assert.equal(etaSeconds(booking, CREATED_AT + DONE_AT), 0)
  assert.equal(etaSeconds(booking, CREATED_AT + DONE_AT + 5000), 0)
})

test("markerProgress is 0 until the rider accepts, then follows the pickup leg", () => {
  const booking = makeBooking()
  assert.equal(markerProgress(booking, CREATED_AT), 0)
  assert.equal(markerProgress(booking, CREATED_AT + ACCEPT_AT - 1), 0)
  assert.equal(markerProgress(booking, CREATED_AT + ACCEPT_AT), 0)
  assert.equal(
    markerProgress(booking, CREATED_AT + (ACCEPT_AT + START_AT) / 2),
    0.5
  )
})

test("markerProgress runs the trip leg after START_AT and clamps at 1", () => {
  const booking = makeBooking()
  assert.equal(markerProgress(booking, CREATED_AT + START_AT), 0)
  assert.equal(
    markerProgress(booking, CREATED_AT + (START_AT + DONE_AT) / 2),
    0.5
  )
  assert.equal(markerProgress(booking, CREATED_AT + DONE_AT), 1)
  assert.equal(markerProgress(booking, CREATED_AT + DONE_AT + 5000), 1)
})

test("riderOrigin offsets the pickup and labels the marker", () => {
  const pickup: GeoPoint = { name: "A", address: "B", lat: 14.5, lng: 121.0 }
  const origin = riderOrigin(pickup)
  assert.equal(origin.name, "Rider")
  assert.equal(origin.address, "Nearby")
  assert.equal(origin.lat, 14.5 + 0.012)
  assert.equal(origin.lng, 121.0 - 0.01)
})

test("statusAt and markerProgress agree that the ride is over at DONE_AT", () => {
  const booking = makeBooking()
  const completedAt = CREATED_AT + DONE_AT
  assert.equal(statusAt(DONE_AT), "completed")
  assert.equal(markerProgress(booking, CREATED_AT + DONE_AT), 1)
})
