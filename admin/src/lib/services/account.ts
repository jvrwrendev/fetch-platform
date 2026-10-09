import type { AdminProfile, AdminSettings, AppNotification } from "@/lib/types"
import {
  ADMIN_CREDENTIALS,
  ADMIN_PROFILE,
  ADMIN_SETTINGS,
} from "@/data/mock/admin"
import { NOTIFICATIONS } from "@/data/mock/generate"
import { delay } from "./client"

export const authService = {
  async login(email: string, password: string): Promise<AdminProfile> {
    const normalized = email.trim().toLowerCase()
    if (normalized !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return Promise.reject(new Error("Invalid email or password."))
    }
    return delay(ADMIN_PROFILE, 400)
  },
}

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    return delay(NOTIFICATIONS)
  },

  async markRead(id: string): Promise<AppNotification> {
    const target = NOTIFICATIONS.find((n) => n.id === id)
    if (!target) return Promise.reject(new Error("Notification not found"))
    target.read = true
    return delay(target, 80)
  },

  async markAllRead(): Promise<AppNotification[]> {
    for (const n of NOTIFICATIONS) n.read = true
    return delay(NOTIFICATIONS, 100)
  },

  async remove(id: string): Promise<void> {
    const index = NOTIFICATIONS.findIndex((n) => n.id === id)
    if (index >= 0) NOTIFICATIONS.splice(index, 1)
    return delay(undefined, 80)
  },
}

export const settingsService = {
  async getProfile(): Promise<AdminProfile> {
    return delay(ADMIN_PROFILE)
  },

  async updateProfile(patch: Partial<AdminProfile>): Promise<AdminProfile> {
    Object.assign(ADMIN_PROFILE, patch)
    if (patch.name) {
      ADMIN_PROFILE.initials = patch.name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]!.toUpperCase())
        .join("")
    }
    return delay(ADMIN_PROFILE, 200)
  },

  async getSettings(): Promise<AdminSettings> {
    return delay(ADMIN_SETTINGS)
  },

  async updateSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    Object.assign(ADMIN_SETTINGS, patch)
    return delay(ADMIN_SETTINGS, 200)
  },
}
