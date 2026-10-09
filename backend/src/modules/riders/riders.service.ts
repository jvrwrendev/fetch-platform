import type { RiderDTO } from "./riders.types"

/**
 * Rider business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const ridersService = {
  async list(): Promise<RiderDTO[]> {
    return []
  },
}