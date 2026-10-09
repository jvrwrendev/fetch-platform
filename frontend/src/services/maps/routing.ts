import type { GeoPoint, LatLng } from "@/shared"

const cache = new Map<string, LatLng[]>()

function key(a: GeoPoint, b: GeoPoint) {
  return `${a.lat.toFixed(5)},${a.lng.toFixed(5)};${b.lat.toFixed(5)},${b.lng.toFixed(5)}`
}

/**
 * Driving geometry from the public OSRM demo server. Falls back to `null` so
 * callers can draw a straight line when the network is unavailable.
 */
export async function fetchDrivingRoute(
  from: GeoPoint,
  to: GeoPoint
): Promise<LatLng[] | null> {
  const cacheKey = key(from, to)
  const hit = cache.get(cacheKey)
  if (hit) return hit
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`route ${res.status}`)
    const data = (await res.json()) as {
      routes?: { geometry?: { coordinates?: number[][] } }[]
    }
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (!coords || coords.length < 2) throw new Error("no route")
    const path = coords.map(([lng, lat]) => ({ lat: lat!, lng: lng! }))
    cache.set(cacheKey, path)
    return path
  } catch {
    return null
  }
}
