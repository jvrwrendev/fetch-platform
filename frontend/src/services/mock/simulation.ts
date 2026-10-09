import type { Booking, GeoPoint, TripStatus } from "@/shared"

/**
 * Mock ride lifecycle. A booking made in the app is driven by the clock rather
 * than by a second device: the rider "accepts" a couple of seconds after the
 * request, drives to the pickup, runs the trip, and finishes — all from
 * `createdAt`, so every screen showing the same booking agrees without any
 * cross-tab messaging.
 */
export const ACCEPT_AT = 2500
export const ARRIVE_AT = 6000
export const START_AT = 9000
export const DONE_AT = 17000

/** Where a simulated rider waits before a trip: a little away from pickup. */
export function riderOrigin(pickup: GeoPoint): GeoPoint {
  return {
    name: "Rider",
    address: "Nearby",
    lat: pickup.lat + 0.012,
    lng: pickup.lng - 0.01,
  }
}

export function statusAt(elapsed: number): TripStatus {
  if (elapsed >= DONE_AT) return "completed"
  if (elapsed >= START_AT) return "in_progress"
  if (elapsed >= ARRIVE_AT) return "arriving"
  if (elapsed >= ACCEPT_AT) return "accepted"
  return "searching"
}

export function isTerminal(status: TripStatus) {
  return status === "completed" || status === "cancelled"
}

/**
 * How far the rider marker is along its current leg, 0..1. Before pickup it
 * approaches the pickup point; once the trip starts it runs to the drop-off.
 */
export function markerProgress(booking: Booking, now: number): number {
  const elapsed = now - new Date(booking.createdAt).getTime()
  if (elapsed >= START_AT) {
    return Math.min(Math.max((elapsed - START_AT) / (DONE_AT - START_AT), 0), 1)
  }
  if (elapsed >= ACCEPT_AT) {
    return Math.min(Math.max((elapsed - ACCEPT_AT) / (START_AT - ACCEPT_AT), 0), 1)
  }
  return 0
}

/** Seconds until the rider reaches the next waypoint. */
export function etaSeconds(booking: Booking, now: number): number {
  const elapsed = now - new Date(booking.createdAt).getTime()
  if (elapsed >= DONE_AT) return 0
  if (elapsed >= START_AT) return Math.ceil((DONE_AT - elapsed) / 1000)
  if (elapsed >= ACCEPT_AT) return Math.ceil((START_AT - elapsed) / 1000)
  return Math.ceil((ACCEPT_AT - elapsed) / 1000)
}
