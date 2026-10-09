import assert from "node:assert/strict"
import test from "node:test"

import {
  BOOKING_TYPES,
  BOOKING_TYPE_CTA,
  BOOKING_TYPE_DESCRIPTION,
  BOOKING_TYPE_TITLE,
  DEFAULT_BOOKING_TYPE,
  resolveBookingType,
  serviceLabel,
} from "../src/booking.ts"

test("BOOKING_TYPES lists ride, pabili and padala", () => {
  assert.deepEqual(BOOKING_TYPES, ["ride", "pabili", "padala"])
  assert.equal(DEFAULT_BOOKING_TYPE, "ride")
})

test("resolveBookingType passes known values through", () => {
  assert.equal(resolveBookingType("ride"), "ride")
  assert.equal(resolveBookingType("pabili"), "pabili")
  assert.equal(resolveBookingType("padala"), "padala")
})

test("resolveBookingType falls back to a ride for anything else", () => {
  assert.equal(resolveBookingType("groceries"), "ride")
  assert.equal(resolveBookingType(null), "ride")
  assert.equal(resolveBookingType(undefined), "ride")
  assert.equal(resolveBookingType(""), "ride")
})

test("serviceLabel names pabili for both audiences", () => {
  assert.equal(serviceLabel("pabili", "commuter"), "Pabili")
  assert.equal(serviceLabel("pabili", "rider"), "Pabili")
})

test("padala reads Pasugo to commuters and Padala to riders", () => {
  assert.equal(serviceLabel("padala", "commuter"), "Pasugo")
  assert.equal(serviceLabel("padala", "rider"), "Padala")
})

test("a plain ride has no service label", () => {
  assert.equal(serviceLabel("ride", "commuter"), "")
  assert.equal(serviceLabel("ride", "rider"), "")
  assert.equal(serviceLabel(undefined, "commuter"), "")
})

test("every service has a title, description and CTA", () => {
  for (const type of BOOKING_TYPES) {
    assert.ok(BOOKING_TYPE_TITLE[type].length > 0)
    assert.ok(BOOKING_TYPE_DESCRIPTION[type].length > 0)
    assert.ok(BOOKING_TYPE_CTA[type].length > 0)
  }
  assert.equal(BOOKING_TYPE_TITLE.padala, "Send a pasugo")
  assert.equal(BOOKING_TYPE_CTA.pabili, "Request pabili")
})
