// Polyline helpers used by the ride simulation to move a vehicle marker
// along a route between two endpoints.

export interface LatLng {
  lat: number
  lng: number
}

/** Cumulative segment lengths (km) for a path, plus total length. */
function segmentLengths(path: LatLng[]): { segments: number[]; total: number } {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const segments: number[] = []
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!
    const b = path[i]!
    const dLat = toRad(b.lat - a.lat)
    const dLng = toRad(b.lng - a.lng)
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
    const km = 2 * R * Math.asin(Math.sqrt(h))
    segments.push(km)
    total += km
  }
  return { segments, total }
}

/**
 * Position at progress `t` (0..1) along a path of coordinates.
 * Linearly interpolates within the segment that `t` falls into, so a
 * marker advances smoothly and follows the drawn route's shape.
 */
export function pointAlong(path: LatLng[], t: number): LatLng {
  if (path.length === 0) throw new Error("pointAlong: empty path")
  if (path.length === 1) return path[0]!
  const clamped = Math.min(Math.max(t, 0), 1)
  const { segments, total } = segmentLengths(path)
  if (total === 0) return path[0]!

  let target = clamped * total
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!
    if (target <= seg || i === segments.length - 1) {
      const ratio = seg === 0 ? 0 : Math.min(target / seg, 1)
      const a = path[i]!
      const b = path[i + 1]!
      return {
        lat: a.lat + (b.lat - a.lat) * ratio,
        lng: a.lng + (b.lng - a.lng) * ratio,
      }
    }
    target -= seg
  }
  return path[path.length - 1]!
}

/** Total route length in km. */
export function pathLengthKm(path: LatLng[]): number {
  return segmentLengths(path).total
}
