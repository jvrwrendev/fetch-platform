import { reportsService } from "./reports.service"

/** HTTP-facing handlers for the reports module. */
export const reportsController = {
  list: () => reportsService.list(),
}