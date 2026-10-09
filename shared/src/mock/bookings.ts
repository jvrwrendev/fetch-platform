import type { Booking } from "../types"
import { DEFAULT_FARE_CONFIG, quoteFare } from "../fare"
import { LOCATIONS } from "./locations"

/** Fare breakdown for a seed booking, computed from the live rates. */
function fare(vehicle: Booking["vehicle"], km: number, cancelled = false) {
  const q = quoteFare(DEFAULT_FARE_CONFIG, vehicle, km)
  return { base: q.base, distance: q.distanceCost, total: cancelled ? 0 : q.total }
}

/** History shown on the passenger and rider apps at first run. */
export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    reference: "FT-90001",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    vehicle: "sedan",
    pickup: LOCATIONS[0]!,
    dropoff: LOCATIONS[2]!,
    fare: fare("sedan", 6.2),
    distanceKm: 6.2,
    status: "completed",
    paymentMethod: "cash",
    createdAt: "2026-10-06T09:30:00Z",
    completedAt: "2026-10-06T10:05:00Z",
  },
  {
    id: "b2",
    reference: "FT-90002",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    vehicle: "motor",
    pickup: LOCATIONS[4]!,
    dropoff: LOCATIONS[1]!,
    fare: fare("motor", 5.4),
    distanceKm: 5.4,
    status: "completed",
    paymentMethod: "gcash",
    createdAt: "2026-10-03T14:10:00Z",
    completedAt: "2026-10-03T14:35:00Z",
  },
  {
    id: "b3",
    reference: "FT-90003",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    vehicle: "suv",
    pickup: LOCATIONS[3]!,
    dropoff: LOCATIONS[6]!,
    fare: fare("suv", 3.1, true),
    distanceKm: 3.1,
    status: "cancelled",
    paymentMethod: "cash",
    createdAt: "2026-10-01T18:45:00Z",
  },
]
