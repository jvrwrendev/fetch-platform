import {
  DEFAULT_FARE_CONFIG,
  NOTIFICATIONS,
  type AdminSettings,
  type FareConfig,
} from "@/shared"
import {
  ADMIN_PROFILE,
  ADMIN_SETTINGS,
  BOOKINGS,
  DASHBOARD_STATS,
  PASSENGERS,
  RIDERS,
  buildReports,
} from "@/data/mock"
import type { AdminApi } from "@/services/api"

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Module-level mutable state stands in for the database the backend will own.
let fareConfig: FareConfig = DEFAULT_FARE_CONFIG
let settings: AdminSettings = ADMIN_SETTINGS

export const mockAdminApi: AdminApi = {
  dashboardStats: () => delay(DASHBOARD_STATS),
  listPassengers: () => delay(PASSENGERS),
  listRiders: () => delay(RIDERS),
  listBookings: () => delay(BOOKINGS),
  listNotifications: () => delay(NOTIFICATIONS),
  reports: (range = 30) => delay(buildReports(range)),
  getFareConfig: () => delay(fareConfig),
  saveFareConfig: (config) => {
    fareConfig = config
    return delay(config)
  },
  getProfile: () => delay(ADMIN_PROFILE),
  getSettings: () => delay(settings),
  saveSettings: (next) => {
    settings = next
    return delay(next)
  },
}
