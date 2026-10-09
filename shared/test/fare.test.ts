import assert from "node:assert/strict"
import test from "node:test"

import {
  DEFAULT_ERRAND_FARE_CONFIG,
  DEFAULT_FARE_CONFIG,
  distanceKm,
  estimateErrandFare,
  estimateFare,
  haversineKm,
  quoteErrand,
  quoteFare,
} from "../src/fare.ts"
import type { GeoPoint } from "../src/types.ts"

const ORIGIN: GeoPoint = {
  name: "Origin",
  address: "0, 0",
  lat: 0,
  lng: 0,
}

const NEAR: GeoPoint = { name: "Near", address: "a", lat: 14.5995, lng: 120.9842 }
const FAR: GeoPoint = { name: "Far", address: "b", lat: 15.5, lng: 121.5 }

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

test("quoteFare adds base, distance and booking fee with no surge", () => {
  const quote = quoteFare(DEFAULT_FARE_CONFIG, 5)
  assert.equal(quote.base, 40)
  assert.equal(quote.distanceCost, 60)
  assert.equal(quote.surgeAdjustment, 0)
  assert.equal(quote.minimumTopUp, 0)
  assert.equal(quote.bookingFee, 15)
  assert.equal(quote.total, 115)
})

test("quoteFare tops up to the minimum fare", () => {
  const quote = quoteFare(DEFAULT_FARE_CONFIG, 0.5)
  assert.equal(quote.subtotal, 46)
  assert.equal(quote.minimumTopUp, 4)
  assert.equal(quote.total, 65)
})

test("quoteFare clamps negative distance to zero", () => {
  const quote = quoteFare(DEFAULT_FARE_CONFIG, -5)
  assert.equal(quote.distanceCost, 0)
  assert.equal(quote.subtotal, 40)
  assert.equal(quote.minimumTopUp, 10)
  assert.equal(quote.total, 65)
})

test("quoteFare applies the surge multiplier to the subtotal", () => {
  const quote = quoteFare(
    { ...DEFAULT_FARE_CONFIG, surgeMultiplier: 1.5 },
    10
  )
  assert.equal(quote.subtotal, 160)
  assert.equal(quote.surgeAdjustment, 80)
  assert.equal(quote.total, 255)
})

test("estimateFare matches quoteFare over the rounded distance", () => {
  const estimate = estimateFare(NEAR, FAR)
  const quote = quoteFare(DEFAULT_FARE_CONFIG, distanceKm(NEAR, FAR))
  assert.deepEqual(estimate, quote)
})

test("estimateFare costs more for a longer trip", () => {
  const near = estimateFare(ORIGIN, NEAR)
  const far = estimateFare(ORIGIN, FAR)
  assert.ok(far.total > near.total)
  assert.ok(far.distanceCost >= near.distanceCost)
})

test("surge overrides do not mutate the default config", () => {
  const before = DEFAULT_FARE_CONFIG.surgeMultiplier
  quoteFare({ ...DEFAULT_FARE_CONFIG, surgeMultiplier: 1.5 }, 5)
  assert.equal(DEFAULT_FARE_CONFIG.surgeMultiplier, before)
})

test("quoteErrand adds base, distance and the stop fee", () => {
  const quote = quoteErrand("pabili", 4)
  assert.equal(quote.base, 60)
  assert.equal(quote.distanceCost, 48)
  assert.equal(quote.stopFee, 25)
  assert.equal(quote.subtotal, 133)
  assert.equal(quote.minimumTopUp, 0)
  assert.equal(quote.bookingFee, 15)
  assert.equal(quote.total, 148)
})

test("quoteErrand clamps negative distance to zero", () => {
  const quote = quoteErrand("padala", -3)
  assert.equal(quote.distanceCost, 0)
  assert.equal(quote.subtotal, 85)
  assert.equal(quote.total, 100)
})

test("quoteErrand tops up to the errand minimum", () => {
  const quote = quoteErrand("pabili", 1, {
    ...DEFAULT_ERRAND_FARE_CONFIG,
    minFare: 200,
  })
  assert.equal(quote.subtotal, 97)
  assert.equal(quote.minimumTopUp, 103)
  assert.equal(quote.total, 215)
})

test("estimateErrandFare matches quoteErrand over the rounded distance", () => {
  const estimate = estimateErrandFare(NEAR, FAR, "padala")
  const quote = quoteErrand("padala", distanceKm(NEAR, FAR))
  assert.deepEqual(estimate, quote)
})

test("errands are priced on their own tariff", () => {
  const ride = estimateFare(NEAR, FAR)
  const errand = estimateErrandFare(NEAR, FAR, "pabili")
  assert.ok(errand.total > ride.total)
  assert.equal(errand.bookingType, "pabili")
})
