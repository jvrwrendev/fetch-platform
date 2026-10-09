import type { PassengerDTO } from "./passengers.types"

/**
 * Passenger business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const passengersService = {
  async list(): Promise<PassengerDTO[]> {
    return []
  },
}