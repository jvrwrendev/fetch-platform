import type { GeoPoint, VehicleType } from "@/lib/types"

const RATES: Record<VehicleType, { base: number; perKm: number }> = {
  motor: { base: 40, perKm: 12 },
  sedan: { base: 60, perKm: 18 },
  suv: { base: 90, perKm: 25 },
}

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

export function estimateFare(
  pickup: GeoPoint,
  dropoff: GeoPoint,
  vehicle: VehicleType
): { distanceKm: number; fare: number } {
  const distanceKm = Math.max(haversineKm(pickup, dropoff), 0.5)
  const { base, perKm } = RATES[vehicle]
  const fare = Math.round(base + distanceKm * perKm)
  return { distanceKm: Math.round(distanceKm * 10) / 10, fare }
}
