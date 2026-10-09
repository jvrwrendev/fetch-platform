import type {
  Booking,
  FareConfig,
  FareQuote,
  GeoPoint,
  PaymentMethod,
  VehicleType,
} from "@/shared"

/** Data a passenger supplies when requesting a ride. */
export interface NewBookingInput {
  passengerId: string
  passengerName: string
  vehicle: VehicleType
  pickup: GeoPoint
  dropoff: GeoPoint
  paymentMethod?: PaymentMethod
}

/**
 * The passenger-facing API surface. A real implementation would hit the
 * backend; `services/mock/mockPassengerApi` is the mock-only one.
 */
export interface PassengerApi {
  listBookings(passengerId: string): Promise<Booking[]>
  createBooking(input: NewBookingInput): Promise<Booking>
  cancelBooking(id: string): Promise<void>
  rateBooking(id: string, rating: number): Promise<void>
  estimateFare(
    pickup: GeoPoint,
    dropoff: GeoPoint,
    vehicle: VehicleType,
    config?: FareConfig
  ): Promise<FareQuote>
}
