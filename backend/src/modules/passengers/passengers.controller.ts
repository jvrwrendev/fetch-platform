import { passengersService } from "./passengers.service"

/** HTTP-facing handlers for the passengers module. */
export const passengersController = {
  list: () => passengersService.list(),
}