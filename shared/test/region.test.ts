import assert from "node:assert/strict"
import test from "node:test"

import {
  clampToRegion,
  isInRegion,
  isInServiceArea,
  LIVE_CITIES,
  LIVE_CITY_NAMES,
  liveCityFor,
  MUNICIPALITIES,
  nearestLiveCity,
  PLANNED_MUNICIPALITIES,
  REGION,
  regionDistanceKm,
} from "../src/region.ts"

const MALAYBALAY = { lat: 8.1550421, lng: 125.1305726 }
const VALENCIA = { lat: 7.9111239, lng: 125.0933669 }
const MARAMAG = { lat: 7.7610686, lng: 125.005158 }
const MANILA = { lat: 14.5995, lng: 120.9842 }

test("the region is Bukidnon with Malaybalay at its centre", () => {
  assert.equal(REGION.name, "Bukidnon")
  assert.equal(REGION.id, "bukidnon")
  assert.deepEqual(REGION.center, MALAYBALAY)
})

test("only Malaybalay and Valencia are live cities", () => {
  assert.deepEqual(LIVE_CITY_NAMES, ["Malaybalay City", "Valencia City"])
  assert.equal(LIVE_CITIES.length, 2)
})

test("the two live cities are in the service area", () => {
  assert.equal(isInServiceArea(MALAYBALAY), true)
  assert.equal(isInServiceArea(VALENCIA), true)
  assert.equal(liveCityFor(MALAYBALAY)?.name, "Malaybalay City")
  assert.equal(liveCityFor(VALENCIA)?.name, "Valencia City")
})

test("towns without riders yet are outside the service area", () => {
  assert.equal(isInServiceArea(MARAMAG), false)
  assert.equal(liveCityFor(MARAMAG), null)
})

test("null and malformed points are outside the service area", () => {
  assert.equal(isInServiceArea(null), false)
  assert.equal(liveCityFor({ lat: Number.NaN, lng: 0 }), null)
})

test("nearestLiveCity picks the closer city for an uncovered town", () => {
  assert.equal(nearestLiveCity(MARAMAG)?.name, "Valencia City")
  assert.equal(nearestLiveCity(MALAYBALAY)?.name, "Malaybalay City")
})

test("isInRegion accepts the province and rejects Manila", () => {
  assert.equal(isInRegion(MALAYBALAY), true)
  assert.equal(isInRegion(MARAMAG), true)
  assert.equal(isInRegion(MANILA), false)
  assert.equal(isInRegion(null), false)
})

test("clampToRegion pulls an outside point into the province box", () => {
  const clamped = clampToRegion(MANILA)
  assert.ok(isInRegion(clamped))
  assert.ok(clamped.lat <= REGION.bounds.maxLat)
  assert.ok(clamped.lng >= REGION.bounds.minLng)
})

test("clampToRegion falls back to the capital for non-finite input", () => {
  assert.deepEqual(clampToRegion({ lat: Number.NaN, lng: Number.NaN }), REGION.center)
})

test("regionDistanceKm is zero for the same point", () => {
  assert.equal(regionDistanceKm(MALAYBALAY, MALAYBALAY), 0)
})

test("municipalities cover the province, with the rest marked planned", () => {
  assert.equal(MUNICIPALITIES.length, 22)
  assert.ok(MUNICIPALITIES.includes("Malaybalay City"))
  assert.ok(MUNICIPALITIES.includes("Valencia City"))
  assert.equal(PLANNED_MUNICIPALITIES.length, 20)
  assert.ok(!PLANNED_MUNICIPALITIES.includes("Malaybalay City"))
  assert.ok(PLANNED_MUNICIPALITIES.includes("Maramag"))
})
