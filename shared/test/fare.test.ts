import assert from "node:assert/strict"
import test from "node:test"

import {
  DEFAULT_FARE_CONFIG,
  billedKm,
  distanceKm,
  estimateFare,
  haversineKm,
  isNightTime,
  quoteFare,
} from "../src/fare.ts"
import type { FareConfig, GeoPoint } from "../src/types.ts"

const ORIGIN: GeoPoint = { name: "Origin", address: "0, 0", lat: 0, lng: 0 }
const NEAR: GeoPoint = { name: "Near", address: "a", lat: 14.5995, lng: 120.9842 }
const FAR: GeoPoint = { name: "Far", address: "b", lat: 15.5, lng: 121.5 }

/** A fixed Manila (UTC+8) time, so the night-window tests are timezone-proof. */
function at(hour: number, minute = 0): Date {
  return new Date(Date.UTC(2026, 9, 10, (hour - 8 + 24) % 24, minute, 0, 0))
}
const NOON = at(12)
const NIGHT = at(23)

const DAY: FareConfig = { ...DEFAULT_FARE_CONFIG, nightRideEnabled: false }

test("haversineKm returns 0 for the same point", () => {
  assert.equal(haversineKm(ORIGIN, ORIGIN), 0)
})

test("haversineKm is symmetric", () => {
  assert.ok(Math.abs(haversineKm(ORIGIN, FAR) - haversineKm(FAR, ORIGIN)) < 1e-9)
})

test("haversineKm measures one degree of latitude as ~111.19 km", () => {
  const km = haversineKm(ORIGIN, { ...ORIGIN, lat: 1 })
  assert.ok(Math.abs(km - 111.19) < 0.05)
})

test("distanceKm clamps identical points to the 0.5 km minimum", () => {
  assert.equal(distanceKm(ORIGIN, ORIGIN), 0.5)
})

test("billedKm rounds partial kilometres up", () => {
  assert.equal(billedKm(6.3), 7)
  assert.equal(billedKm(6.0), 6)
  assert.equal(billedKm(0.1), 1)
  assert.equal(billedKm(0), 0)
})

test("up to 5 km is the flat base fare", () => {
  for (const km of [0.5, 3, 5]) {
    const q = quoteFare(DAY, km, NOON)
    assert.equal(q.billedKm, km === 0.5 ? 1 : km)
    assert.equal(q.baseFare, 60)
    assert.equal(q.tier1Charge, 0)
    assert.equal(q.tier2Charge, 0)
    assert.equal(q.total, 60)
  }
})

test("tier 1 charges ₱10 a km over the base, up to 10 km", () => {
  const q = quoteFare(DAY, 6.3, NOON) // billed 7
  assert.equal(q.billedKm, 7)
  assert.equal(q.tier1Km, 2)
  assert.equal(q.tier1Charge, 20)
  assert.equal(q.tier2Charge, 0)
  assert.equal(q.daytimeTotal, 80)

  const edge = quoteFare(DAY, 10, NOON)
  assert.equal(edge.tier1Km, 5)
  assert.equal(edge.tier1Charge, 50)
  assert.equal(edge.daytimeTotal, 110)
})

test("tier 2 charges ₱20 a km beyond 10 km, off the ₱110 fixed amount", () => {
  const q = quoteFare(DAY, 12.4, NOON) // billed 13
  assert.equal(q.billedKm, 13)
  assert.equal(q.tier1Charge, 50)
  assert.equal(q.tier2Km, 3)
  assert.equal(q.tier2Charge, 60)
  assert.equal(q.daytimeTotal, 170)
})

test("the tier boundary is inclusive of the lower tier", () => {
  // Just over 10 km bills as 11 and starts tier 2.
  const q = quoteFare(DAY, 10.0001, NOON)
  assert.equal(q.billedKm, 11)
  assert.equal(q.tier2Km, 1)
  assert.equal(q.daytimeTotal, 130)
})

test("night is off by default during the day", () => {
  const q = quoteFare(DEFAULT_FARE_CONFIG, 5, NOON)
  assert.equal(q.nightApplied, false)
  assert.equal(q.nightSurcharge, 0)
  assert.equal(q.total, 60)
})

test("a flat night fee is added between 22:00 and 05:00", () => {
  const q = quoteFare(DEFAULT_FARE_CONFIG, 5, NIGHT)
  assert.equal(q.nightApplied, true)
  assert.equal(q.nightMode, "flat")
  assert.equal(q.nightValue, 30)
  assert.equal(q.nightSurcharge, 30)
  assert.equal(q.total, 90)
})

test("a percentage night boost multiplies the daytime total", () => {
  const percent: FareConfig = {
    ...DEFAULT_FARE_CONFIG,
    nightMode: "percentage",
    nightPercent: 20,
  }
  const q = quoteFare(percent, 12.4, at(23, 15)) // daytime 170
  assert.equal(q.daytimeTotal, 170)
  assert.equal(q.nightSurcharge, 34)
  assert.equal(q.total, 204)
})

test("the night window wraps midnight and is exclusive at the end", () => {
  assert.equal(isNightTime(DEFAULT_FARE_CONFIG, at(21, 59)), false)
  assert.equal(isNightTime(DEFAULT_FARE_CONFIG, at(22, 0)), true)
  assert.equal(isNightTime(DEFAULT_FARE_CONFIG, at(0, 30)), true)
  assert.equal(isNightTime(DEFAULT_FARE_CONFIG, at(4, 59)), true)
  assert.equal(isNightTime(DEFAULT_FARE_CONFIG, at(5, 0)), false)
})

test("disabling the night ride removes the surcharge even at night", () => {
  const q = quoteFare(DAY, 5, NIGHT)
  assert.equal(q.nightApplied, false)
  assert.equal(q.total, 60)
})

test("estimateFare prices from two points at the given time", () => {
  const estimate = estimateFare(NEAR, FAR, DAY, NOON)
  const quote = quoteFare(DAY, distanceKm(NEAR, FAR), NOON)
  assert.deepEqual(estimate, quote)
})
