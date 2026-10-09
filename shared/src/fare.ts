import type { BookingType, FareConfig, FareQuote, GeoPoint, PaymentMethod, VehicleType } from "./types"

export const DEFAULT_FARE_CONFIG: FareConfig = {
  vehicle: {
    motor: { base: 40, perKm: 12 },
    sedan: { base: 60, perKm: 18 },
    suv: { base: 90, perKm: 25 },
  },
  bookingFee: 15,
  minFare: 50,
  surgeMultiplier: 1,
}

export const SURGE_MIN = 1
export const SURGE_MAX = 3
export const SURGE_STEP = 0.1

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "gcash", "maya"]

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function distanceKm(pickup: GeoPoint, dropoff: GeoPoint): number {
  return Math.round(Math.max(haversineKm(pickup, dropoff), 0.5) * 10) / 10
}

export function quoteFare(
  config: FareConfig,
  vehicle: VehicleType,
  km: number
): FareQuote {
  const rate = config.vehicle[vehicle]
  const base = rate.base
  const distanceCost = Math.round(Math.max(km, 0) * rate.perKm)
  const subtotal = base + distanceCost
  const surgeAdjustment = Math.round(subtotal * (config.surgeMultiplier - 1))
  const afterSurge = subtotal + surgeAdjustment
  const minimumTopUp = Math.max(config.minFare - afterSurge, 0)
  const bookingFee = config.bookingFee
  const total = Math.round(afterSurge + minimumTopUp + bookingFee)

  return {
    vehicle,
    distanceKm: Math.round(Math.max(km, 0) * 10) / 10,
    base,
    distanceCost,
    subtotal,
    surgeAdjustment,
    minimumTopUp,
    bookingFee,
    total,
  }
}

/** Convenience for the rider/passenger app: quote straight from two points. */
export function estimateFare(
  pickup: GeoPoint,
  dropoff: GeoPoint,
  vehicle: VehicleType,
  config: FareConfig = DEFAULT_FARE_CONFIG
): FareQuote {
  return quoteFare(config, vehicle, distanceKm(pickup, dropoff))
}

/** The errand half of {@link BookingType}: pabili and pasugo (padala). */
export type ErrandType = Exclude<BookingType, "ride">

/**
 * Errand pricing (pabili / pasugo).
 *
 * Errands get their own tariff rather than a vehicle class: the work is the
 * same whichever vehicle turns up, and the shop/collection stop is the part
 * that needs covering. It lives here beside the ride tariff so a rate change
 * still has one home.
 */
export interface ErrandFareConfig {
  base: number
  perKm: number
  /** Flat fee for the shop/collection stop. */
  stopFee: number
  /** Floor on the errand portion, before the booking fee. */
  minFare: number
  bookingFee: number
}

export const DEFAULT_ERRAND_FARE_CONFIG: ErrandFareConfig = {
  base: 60,
  perKm: 12,
  stopFee: 25,
  minFare: 60,
  bookingFee: 15,
}

export interface ErrandQuote {
  bookingType: ErrandType
  distanceKm: number
  base: number
  distanceCost: number
  stopFee: number
  subtotal: number
  minimumTopUp: number
  bookingFee: number
  total: number
}

/** Price one errand from a distance in km. */
export function quoteErrand(
  bookingType: ErrandType,
  km: number,
  config: ErrandFareConfig = DEFAULT_ERRAND_FARE_CONFIG
): ErrandQuote {
  const distance = Math.max(km, 0)
  const distanceCost = Math.round(distance * config.perKm)
  const subtotal = config.base + distanceCost + config.stopFee
  const minimumTopUp = Math.max(config.minFare - subtotal, 0)
  const total = Math.round(subtotal + minimumTopUp + config.bookingFee)

  return {
    bookingType,
    distanceKm: Math.round(distance * 10) / 10,
    base: config.base,
    distanceCost,
    stopFee: config.stopFee,
    subtotal,
    minimumTopUp,
    bookingFee: config.bookingFee,
    total,
  }
}

/** Convenience for the app: quote an errand straight from two points. */
export function estimateErrandFare(
  pickup: GeoPoint,
  dropoff: GeoPoint,
  bookingType: ErrandType,
  config: ErrandFareConfig = DEFAULT_ERRAND_FARE_CONFIG
): ErrandQuote {
  return quoteErrand(bookingType, distanceKm(pickup, dropoff), config)
}
