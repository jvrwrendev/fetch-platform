import type { UserDTO } from "./users.types"

/**
 * User business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const usersService = {
  async list(): Promise<UserDTO[]> {
    return []
  },
}