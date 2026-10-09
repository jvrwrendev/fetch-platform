import { INITIAL_BOOKINGS, type Booking, type TripStatus } from "@/shared"
import type { RiderApi } from "@/services/api"

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const mockRiderApi: RiderApi = {
  listOpenRequests: () =>
    delay(INITIAL_BOOKINGS.filter((b: Booking) => b.status === "searching")),

  listForRider: (riderId) =>
    delay(INITIAL_BOOKINGS.filter((b: Booking) => b.riderId === riderId)),

  acceptBooking: () => delay(undefined),
  rejectBooking: () => delay(undefined),
  advance: (_id: string, _status: TripStatus) => delay(undefined),
  setAvailability: () => delay(undefined),
}
