import type { GeoPoint } from "@/lib/types"

type LatLng = [number, number]

const cache = new Map<string, LatLng[]>()

function key(a: GeoPoint, b: GeoPoint) {
  return `${a.lat.toFixed(5)},${a.lng.toFixed(5)};${b.lat.toFixed(5)},${b.lng.toFixed(5)}`
}

export async function fetchDrivingRoute(
  a: GeoPoint,
  b: GeoPoint
): Promise<LatLng[] | null> {
  const k = key(a, b)
  const hit = cache.get(k)
  if (hit) return hit
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`route ${res.status}`)
    const data = (await res.json()) as {
      routes?: { geometry?: { coordinates?: number[][] } }[]
    }
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (!coords || coords.length < 2) throw new Error("no route")
    const latLng = coords.map(([lng, lat]) => [lat, lng] as LatLng)
    cache.set(k, latLng)
    return latLng
  } catch {
    return null
  }
}
