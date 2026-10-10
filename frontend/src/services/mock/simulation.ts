import type { Booking, GeoPoint, LatLng, TripStatus } from "@/shared"

/**
 * Trip progress, derived from the trip's real status.
 *
 * The rider advances the trip in their app, so the marker and the ETA follow
 * the status Convex holds — not a client-side clock. Each leg is eased over an
 * expected duration from the timestamp the backend stamps when that leg begins,
 * so the marker moves smoothly without inventing a timeline.
 */

export const PICKUP_LEG_MS = 150_000
export const TRIP_LEG_MS = 240_000

export function isTerminal(status: TripStatus): boolean {
  return status === "completed" || status === "cancelled"
}

/** Where a rider waits before a trip: a little away from pickup. */
export function riderOrigin(pickup: GeoPoint): GeoPoint {
  return {
    name: "Rider",
    address: "Nearby",
    lat: pickup.lat + 0.012,
    lng: pickup.lng - 0.01,
  }
}

function elapsedMs(since: string | undefined, now: number): number {
  if (!since) return 0
  const start = +new Date(since)
  return Number.isFinite(start) ? Math.max(0, now - start) : 0
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1)
}

function lerp(a: LatLng, b: LatLng, t: number): LatLng {
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  }
}

/** Marker progress (0..1) along the current leg, from the trip's status. */
export function markerProgress(booking: Booking, now: number): number {
  switch (booking.status) {
    case "accepted":
      return clamp01(elapsedMs(booking.acceptedAt, now) / PICKUP_LEG_MS) * 0.6
    case "arriving":
      // The rider has declared they are close; never less than 60% up the leg.
      return 0.6 + clamp01(elapsedMs(booking.acceptedAt, now) / PICKUP_LEG_MS) * 0.4
    case "in_progress":
      return clamp01(elapsedMs(booking.startedAt, now) / TRIP_LEG_MS)
    case "completed":
      return 1
    default:
      return 0
  }
}

/** Where the rider marker sits: first to the pickup, then to the drop-off. */
export function riderMarker(booking: Booking, now: number): LatLng | null {
  const t = markerProgress(booking, now)
  if (booking.status === "accepted" || booking.status === "arriving") {
    return lerp(riderOrigin(booking.pickup), booking.pickup, t)
  }
  if (booking.status === "in_progress" || booking.status === "completed") {
    return lerp(booking.pickup, booking.dropoff, t)
  }
  return null
}

/** One line of status copy, for the tracking screen. */
export function etaLabel(status: TripStatus): string {
  switch (status) {
    case "searching":
      return "Finding a rider…"
    case "accepted":
      return "Rider accepted your request"
    case "arriving":
      return "Rider is arriving"
    case "in_progress":
      return "On the way to the drop-off"
    case "completed":
      return "Trip completed"
    case "cancelled":
      return "Trip cancelled"
  }
}
