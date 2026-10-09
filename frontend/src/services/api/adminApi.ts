import type {
  AdminProfile,
  AdminSettings,
  AppNotification,
  Booking,
  DashboardStats,
  FareConfig,
  Passenger,
  ReportsSummary,
  Rider,
} from "@/shared"

/** The admin console API surface. */
export interface AdminApi {
  dashboardStats(): Promise<DashboardStats>
  listPassengers(): Promise<Passenger[]>
  listRiders(): Promise<Rider[]>
  listBookings(): Promise<Booking[]>
  listNotifications(): Promise<AppNotification[]>
  reports(range?: number): Promise<ReportsSummary>
  getFareConfig(): Promise<FareConfig>
  saveFareConfig(config: FareConfig): Promise<FareConfig>
  getProfile(): Promise<AdminProfile>
  getSettings(): Promise<AdminSettings>
  saveSettings(settings: AdminSettings): Promise<AdminSettings>
}
