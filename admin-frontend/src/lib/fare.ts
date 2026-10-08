import type { FareConfig, FareQuote, GeoPoint, VehicleType } from "@/lib/types"

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
