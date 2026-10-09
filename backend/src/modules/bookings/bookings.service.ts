import type { BookingDTO } from "./bookings.types"

/**
 * Booking business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const bookingsService = {
  async list(): Promise<BookingDTO[]> {
    return []
  },
}