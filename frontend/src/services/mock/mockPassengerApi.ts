import {
  estimateErrandFare,
  estimateFare,
  INITIAL_BOOKINGS,
  type Booking,
  type FareConfig,
  type FareQuote,
  type GeoPoint,
} from "@/shared"
import type { NewBookingInput, PassengerApi } from "@/services/api"

/** Small artificial latency so screens exercise their loading states. */
function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const mockPassengerApi: PassengerApi = {
  listBookings: (passengerId) =>
    delay(INITIAL_BOOKINGS.filter((b) => b.passengerId === passengerId)),

  createBooking: (input: NewBookingInput) => {
    const errand =
      input.bookingType === "pabili" || input.bookingType === "padala"
        ? estimateErrandFare(input.pickup, input.dropoff, input.bookingType)
        : null
    const ride = errand
      ? null
      : estimateFare(input.pickup, input.dropoff)
    const quote = errand ?? ride!
    const fare = errand
      ? {
          base: errand.base + errand.stopFee,
          distance: errand.distanceCost,
          total: errand.total,
        }
      : { base: ride!.base, distance: ride!.distanceCost, total: ride!.total }

    const booking: Booking = {
      ...input,
      id: `b${Date.now()}`,
      reference: `FT-${Date.now().toString().slice(-6)}`,
      distanceKm: quote.distanceKm,
      fare,
      status: "searching",
      paymentMethod: input.paymentMethod ?? "cash",
      createdAt: new Date().toISOString(),
    }
    return delay(booking)
  },

  cancelBooking: () => delay(undefined),
  rateBooking: () => delay(undefined),

  estimateFare: (
    pickup: GeoPoint,
    dropoff: GeoPoint,
    config?: FareConfig
  ): Promise<FareQuote> => delay(estimateFare(pickup, dropoff, config)),
}
