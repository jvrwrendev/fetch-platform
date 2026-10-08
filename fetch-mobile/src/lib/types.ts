export type Role = "passenger" | "rider"

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

export interface GeoPoint {
  name: string
  address: string
  lat: number
  lng: number
}

export type VehicleType = "motor" | "sedan" | "suv"

export type TripStatus =
  | "searching"
  | "accepted"
  | "arriving"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface Booking {
  id: string
  passengerId: string
  passengerName: string
  riderId?: string
  riderName?: string
  vehicle: VehicleType
  pickup: GeoPoint
  dropoff: GeoPoint
  fare: number
  distanceKm: number
  status: TripStatus
  createdAt: string
  completedAt?: string
}
