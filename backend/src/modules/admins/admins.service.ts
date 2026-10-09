import type { AdminDTO } from "./admins.types"

/**
 * Admin business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const adminsService = {
  async list(): Promise<AdminDTO[]> {
    return []
  },
}