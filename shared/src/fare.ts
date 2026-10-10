import type {
  BookingType,
  FareConfig,
  FareQuote,
  GeoPoint,
  PaymentMethod,
} from "./types"

/**
 * The FETCH tariff.
 *
 * A base fare covers the first stretch of every trip, then two distance tiers
 * price the rest. Every trip is billed in whole kilometres — a trip of 6.3 km
 * is charged as 7 km — and an optional night surcharge applies automatically
 * between the configured hours when the admin has switched it on.
 *
 * This is the one place a price is decided. The phone, the browser, the admin
 * console and the server all import it, so a change has a single definition.
 */
export const DEFAULT_FARE_CONFIG: FareConfig = {
  baseFare: 60,
  baseDistanceKm: 5,
  tier1RatePerKm: 10,
  tier1MaxKm: 10,
  tier2RatePerKm: 20,

  nightRideEnabled: true,
  nightStartHour: 22,
  nightEndHour: 5,
  timezoneOffsetHours: 8,
  nightMode: "flat",
  nightFlatFee: 30,
  nightPercent: 20,
}

export const NIGHT_MODES = ["flat", "percentage"] as const

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "ewallet"]

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

/** Partial kilometres round up: 6.3 km is billed as 7. */
export function billedKm(km: number): number {
  if (!Number.isFinite(km) || km <= 0) return 0
  return Math.ceil(km)
}

/**
 * Whether `at` falls in the night window.
 *
 * The window may wrap midnight (the default 22:00–05:00 does), so it is two
 * comparisons joined by OR rather than a single `start <= hour < end`. The hour
 * is read in the config's timezone, not the runtime's, so the same trip is
 * "night" on the phone, in the console and on the server — which runs in UTC.
 */
export function isNightTime(
  config: FareConfig,
  at: Date | number = Date.now()
): boolean {
  if (!config.nightRideEnabled) return false
  const date = at instanceof Date ? at : new Date(at)
  const hour =
    (date.getUTCHours() + config.timezoneOffsetHours + 24) % 24
  return hour >= config.nightStartHour || hour < config.nightEndHour
}

/** Price one trip. `at` is the ride time; it defaults to now. */
export function quoteFare(
  config: FareConfig,
  km: number,
  at: Date | number = Date.now()
): FareQuote {
  const billed = billedKm(km)
  const baseFare = config.baseFare

  const tier1Km = Math.max(
    Math.min(billed, config.tier1MaxKm) - config.baseDistanceKm,
    0
  )
  const tier2Km = Math.max(billed - config.tier1MaxKm, 0)
  const tier1Charge = tier1Km * config.tier1RatePerKm
  const tier2Charge = tier2Km * config.tier2RatePerKm
  const daytimeTotal = baseFare + tier1Charge + tier2Charge

  const when = at instanceof Date ? at : new Date(at)
  const nightApplied = isNightTime(config, when)
  const nightValue = config.nightMode === "flat" ? config.nightFlatFee : config.nightPercent
  const nightSurcharge = nightApplied
    ? Math.round(
        config.nightMode === "flat"
          ? config.nightFlatFee
          : daytimeTotal * (config.nightPercent / 100)
      )
    : 0

  return {
    distanceKm: Math.round(Math.max(km, 0) * 10) / 10,
    billedKm: billed,
    baseFare,
    tier1Km,
    tier1Charge,
    tier2Km,
    tier2Charge,
    daytimeTotal,
    at: when.toISOString(),
    nightApplied,
    nightMode: config.nightMode,
    nightValue,
    nightSurcharge,
    total: daytimeTotal + nightSurcharge,
  }
}

/** Convenience for the app: quote straight from two points. */
export function estimateFare(
  pickup: GeoPoint,
  dropoff: GeoPoint,
  config: FareConfig = DEFAULT_FARE_CONFIG,
  at: Date | number = Date.now()
): FareQuote {
  return quoteFare(config, distanceKm(pickup, dropoff), at)
}

/** The errand half of {@link BookingType}: pabili and pasugo (padala). */
export type ErrandType = Exclude<BookingType, "ride">
