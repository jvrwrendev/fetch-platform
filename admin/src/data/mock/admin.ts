import type { AdminProfile, AdminSettings } from "@/lib/types"

export const ADMIN_PROFILE: AdminProfile = {
  id: "admin-1",
  name: "Paolo Villanueva",
  email: "admin@fetch.ph",
  phone: "+63 917 555 0142",
  role: "Platform Administrator",
  city: "Taguig City",
  joinedAt: "2024-03-11T08:00:00+08:00",
  initials: "PV",
}

export const ADMIN_SETTINGS: AdminSettings = {
  theme: "system",
  emailNotifications: true,
  bookingAlerts: true,
  riderApprovalAlerts: true,
  weeklyReportDigest: false,
  currency: "PHP (₱)",
  timezone: "Asia/Manila (UTC+8)",
  language: "English (Philippines)",
}

export const ADMIN_CREDENTIALS = {
  email: "admin@fetch.ph",
  password: "admin123",
}
