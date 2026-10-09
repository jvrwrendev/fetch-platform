// Single source of truth for the domain model.
// Merged from both apps: admin's richer Booking/Fare shape wins, mobile's
// Role/User auth shape is kept alongside it.

export type Role = "passenger" | "rider"

export type VehicleType = "motor" | "sedan" | "suv"

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
  type: VehicleType
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

export interface VehicleRate {
  base: number
  perKm: number
}

export interface FareConfig {
  vehicle: Record<VehicleType, VehicleRate>
  bookingFee: number
  minFare: number
  surgeMultiplier: number
}

export interface FareQuote {
  vehicle: VehicleType
  distanceKm: number
  base: number
  distanceCost: number
  subtotal: number
  surgeAdjustment: number
  minimumTopUp: number
  bookingFee: number
  total: number
}

export type PaymentMethod = "cash" | "gcash" | "maya"

export interface Booking {
  id: string
  reference: string
  passengerId: string
  passengerName: string
  riderId?: string
  riderName?: string
  vehicle: VehicleType
  pickup: GeoPoint
  dropoff: GeoPoint
  distanceKm: number
  fare: BookingFare
  status: TripStatus
  paymentMethod: PaymentMethod
  createdAt: string
  completedAt?: string
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
  bookingsByVehicle: { vehicle: VehicleType; count: number; revenue: number }[]
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
