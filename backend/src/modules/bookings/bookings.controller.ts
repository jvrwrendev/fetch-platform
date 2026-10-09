import { bookingsService } from "./bookings.service"

/** HTTP-facing handlers for the bookings module. */
export const bookingsController = {
  list: () => bookingsService.list(),
}