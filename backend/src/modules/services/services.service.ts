import type { ServiceDTO } from "./services.types"

/**
 * Service business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const servicesService = {
  async list(): Promise<ServiceDTO[]> {
    return []
  },
}