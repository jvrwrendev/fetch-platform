// Single source of truth for the domain model.
// Merged from both apps: admin's richer Booking/Fare shape wins, mobile's
// Role/User auth shape is kept alongside it.

export type Role = "passenger" | "rider"

/** The one vehicle class the platform runs: motorcycle taxis. */
export const VEHICLE_LABEL = "Motorcycle"

/**
 * What a passenger is asking for.
 *
 * `ride`   — take me from A to B.
 * `pabili` — buy this at the store and bring it to me ("pabili" = to buy).
 * `padala` — pick this up and deliver it to B. Shown to passengers as
 *            "Pasugo" (the local word for running an errand) and to riders as
 *            "Padala". All three share the ride lifecycle; only the request
 *            payload and the receipt differ.
 */
export type BookingType = "ride" | "pabili" | "padala"

/** One line of a pabili/pasugo shopping list. */
export interface BookingErrandItem {
  name: string
  qty: number
  note?: string
}

export type TripStatus =
  | "searching"
  | "accepted"
  | "arriving"
  | "in_progress"
  | "completed"
  | "cancelled"

export type PassengerStatus = "active" | "inactive"

export type RiderApproval = "pending" | "approved" | "rejected"

export type RiderStatus = "active" | "inactive" | "suspended"

export type RiderAvailability = "online" | "offline" | "on_trip"

export type NotificationKind = "system" | "booking"

export type NotificationSeverity = "info" | "success" | "warning" | "danger"

export interface GeoPoint {
  name: string
  address: string
  lat: number
  lng: number
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  rating: number
  totalTrips: number
  vehicleModel?: string
  plateNumber?: string
  /** Rider online/offline, persisted on the account. */
  online?: boolean
}

export interface Passenger {
  id: string
  name: string
  email: string
  phone: string
  status: PassengerStatus
  rating: number
  totalTrips: number
  totalSpend: number
  joinedAt: string
  lastActiveAt: string
  city: string
}

export interface RiderVehicle {
  model: string
  plateNumber: string
}

export interface Rider {
  id: string
  name: string
  email: string
  phone: string
  approval: RiderApproval
  status: RiderStatus
  availability: RiderAvailability
  rating: number
  totalTrips: number
  completedTrips: number
  cancelRate: number
  vehicle: RiderVehicle
  licenseNumber: string
  joinedAt: string
  lastActiveAt: string
  city: string
  location: GeoPoint
}

export interface BookingFare {
  base: number
  distance: number
  total: number
}

/** How the night surcharge is charged. */
export type NightRideMode = "flat" | "percentage"

/**
 * The tariff: a base that covers the first stretch, then two distance tiers,
 * plus an optional night surcharge the admin can switch on.
 */
export interface FareConfig {
  /** Covers `baseDistanceKm` and everything under it. */
  baseFare: number
  /** How far the base fare reaches, in km. */
  baseDistanceKm: number
  /** Extra per km from `baseDistanceKm` up to `tier1MaxKm`. */
  tier1RatePerKm: number
  /** Where tier 1 ends and tier 2 begins, in km. */
  tier1MaxKm: number
  /** Extra per km beyond `tier1MaxKm`. */
  tier2RatePerKm: number

  nightRideEnabled: boolean
  /** Start of the night window, 24h. Default 22 (10 PM). */
  nightStartHour: number
  /** End of the night window (exclusive), 24h. Default 5 (5 AM). */
  nightEndHour: number
  /**
   * Which timezone the night hours are read in, as an offset from UTC.
   * Default 8 — Bukidnon (Asia/Manila) — so the window means the same thing on
   * the phone, in the browser and on the server.
   */
  timezoneOffsetHours: number
  nightMode: NightRideMode
  nightFlatFee: number
  /** Percent boost on the daytime total, when mode is "percentage". */
  nightPercent: number
}

/** One fare, line by line, as the quote screens show it. */
export interface FareQuote {
  /** The raw distance, km. */
  distanceKm: number
  /** The distance actually billed, km (always a whole number). */
  billedKm: number
  baseFare: number
  /** Billable km inside tier 1 (over the base, up to tier1MaxKm). */
  tier1Km: number
  tier1Charge: number
  /** Billable km beyond tier1MaxKm. */
  tier2Km: number
  tier2Charge: number
  /** Base + tiers, before any night surcharge. */
  daytimeTotal: number
  /** The ride time the quote was priced at. */
  at: string
  nightApplied: boolean
  nightMode: NightRideMode
  /** The configured value: pesos for flat, percent for percentage. */
  nightValue: number
  nightSurcharge: number
  total: number
}

export type PaymentMethod = "cash" | "ewallet"

export interface Booking {
  id: string
  reference: string
  passengerId: string
  passengerName: string
  riderId?: string
  riderName?: string
  pickup: GeoPoint
  dropoff: GeoPoint
  distanceKm: number
  fare: BookingFare
  status: TripStatus
  paymentMethod: PaymentMethod
  createdAt: string
  completedAt?: string
  rating?: number
  /** When a rider accepted the request — the pickup leg's start. */
  acceptedAt?: string
  /** When the trip actually started — the drop-off leg's start. */
  startedAt?: string
  /** Riders who turned this request down, so it stays open for others. */
  declinedBy?: string[]
  /** What the passenger asked for. Absent on older rows means a plain ride. */
  bookingType?: BookingType
  /** Pabili/pasugo shopping list. */
  items?: BookingErrandItem[]
  /** Cash the passenger commits up front to cover a pabili purchase. */
  itemBudget?: number
  /** Free-text note from the passenger (errand details, directions). */
  notes?: string
  /** Padala/pasugo recipient, when the goods go to someone else. */
  recipientName?: string
  recipientPhone?: string
}

export interface AppNotification {
  id: string
  kind: NotificationKind
  severity: NotificationSeverity
  title: string
  message: string
  read: boolean
  createdAt: string
  reference?: string
}

export interface AdminProfile {
  id: string
  name: string
  email: string
  phone: string
  role: string
  city: string
  joinedAt: string
  initials: string
}

export interface AdminSettings {
  theme: "light" | "dark" | "system"
  emailNotifications: boolean
  bookingAlerts: boolean
  riderApprovalAlerts: boolean
  weeklyReportDigest: boolean
  currency: string
  timezone: string
  language: string
}

export interface DashboardStats {
  totalPassengers: number
  totalRiders: number
  totalBookings: number
  activeTrips: number
  totalRevenue: number
  revenueDelta: number
  bookingsDelta: number
  passengersDelta: number
  ridersDelta: number
  activeTripsDelta: number
}

export interface RevenuePoint {
  date: string
  revenue: number
  bookings: number
}

export interface ReportsSummary {
  revenueByDay: RevenuePoint[]
  bookingsByStatus: { status: TripStatus; count: number }[]
  bookingsByService: { type: BookingType; count: number; revenue: number }[]
  topRoutes: { route: string; count: number; revenue: number }[]
  topRiders: { id: string; name: string; trips: number; revenue: number; rating: number }[]
  passengerGrowth: { month: string; passengers: number }[]
  kpis: {
    totalBookings: number
    totalRevenue: number
    avgFare: number
    completionRate: number
    cancelRate: number
    activeRiders: number
    newPassengers: number
    avgRating: number
  }
}
