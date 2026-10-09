import type { GeoPoint, LatLng } from "@/shared"
import { LOCATIONS } from "@/shared"

/** Forward geocoding over the mock location set. */
export function geocode(query: string): GeoPoint[] {
  const q = query.trim().toLowerCase()
  if (!q) return LOCATIONS.slice(0, 6)
  return LOCATIONS.filter(
    (place) =>
      place.name.toLowerCase().includes(q) || place.address.toLowerCase().includes(q)
  ).slice(0, 8)
}

/** Nearest known place to a coordinate — the mock reverse geocoder. */
export function reverseGeocode(point: LatLng): GeoPoint {
  let best = LOCATIONS[0]!
  let bestDist = Number.POSITIVE_INFINITY
  for (const place of LOCATIONS) {
    const dist = (place.lat - point.lat) ** 2 + (place.lng - point.lng) ** 2
    if (dist < bestDist) {
      bestDist = dist
      best = place
    }
  }
  return best
}
