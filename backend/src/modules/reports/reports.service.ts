import type { ReportDTO } from "./reports.types"

/**
 * Report business logic. Mock-only placeholder: implement against the database
 * client in src/database when the real service lands.
 */
export const reportsService = {
  async list(): Promise<ReportDTO[]> {
    return []
  },
}