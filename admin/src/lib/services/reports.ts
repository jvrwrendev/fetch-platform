import { api } from "@convex/_generated/api"
import { convex } from "@/lib/convex"
import type { DashboardStats, ReportsSummary, RevenuePoint } from "@/lib/types"

/**
 * Reports and headline stats, computed server-side from the real bookings so
 * the console never disagrees with what a passenger just did.
 */
export const reportsService = {
  async dashboardStats(): Promise<DashboardStats> {
    return (await convex.query(api.admin.stats)) as DashboardStats
  },

  async revenueSeries(days: number): Promise<RevenuePoint[]> {
    const summary = (await convex.query(api.admin.reports, {
      range: days,
    })) as ReportsSummary
    return summary.revenueByDay
  },

  async reports(range: number): Promise<ReportsSummary> {
    return (await convex.query(api.admin.reports, {
      range,
    })) as ReportsSummary
  },
}
