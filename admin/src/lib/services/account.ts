import type { AdminProfile, AdminSettings, AppNotification } from "@/lib/types"
import { api } from "@convex/_generated/api"
import { convex } from "@/lib/convex"
import {
  ADMIN_CREDENTIALS,
  ADMIN_PROFILE,
  ADMIN_SETTINGS,
} from "@/data/mock/admin"
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
    let rows = (await convex.query(api.notifications.listMine, {
      userId: "admin",
    })) as AppNotification[]
    if (rows.length === 0) {
      await convex.mutation(api.notifications.seedAdmin, {})
      rows = (await convex.query(api.notifications.listMine, {
        userId: "admin",
      })) as AppNotification[]
    }
    return rows
  },

  async markRead(id: string): Promise<void> {
    await convex.mutation(api.notifications.markRead, { id })
  },

  async markAllRead(): Promise<void> {
    await convex.mutation(api.notifications.markAllRead, { userId: "admin" })
  },

  async remove(id: string): Promise<void> {
    await convex.mutation(api.notifications.remove, { id })
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
