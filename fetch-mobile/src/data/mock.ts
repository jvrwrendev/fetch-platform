import type { Booking, GeoPoint, User, VehicleType } from "@/lib/types"

export const LOCATIONS: GeoPoint[] = [
  { name: "Makati Central", address: "Ayala Ave, Makati", lat: 14.5547, lng: 121.0244 },
  { name: "Bonifacio Global City", address: "5th Ave, Taguig", lat: 14.5516, lng: 121.0499 },
  { name: "SM Mall of Asia", address: "Pasay City", lat: 14.535, lng: 120.9837 },
  { name: "Quezon City Memorial Circle", address: "Elliptical Rd, QC", lat: 14.6517, lng: 121.05 },
  { name: "Intramuros", address: "Manila Old Town", lat: 14.5916, lng: 120.9737 },
  { name: "NAIA Terminal 3", address: "Pasay City", lat: 14.5086, lng: 121.0198 },
  { name: "Ortigas Center", address: "EDSA, Mandaluyong", lat: 14.5866, lng: 121.0554 },
  { name: "Cubao Expo", address: "Araneta Center, QC", lat: 14.6219, lng: 121.0532 },
]

export const USERS: User[] = [
  {
    id: "p1",
    name: "Alex Reyes",
    email: "alex@example.com",
    phone: "+63 917 555 0101",
    role: "passenger",
    rating: 4.8,
    totalTrips: 23,
  },
  {
    id: "r1",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "+63 918 555 0202",
    role: "rider",
    rating: 4.9,
    totalTrips: 312,
    vehicleModel: "Toyota Vios 2022",
    plateNumber: "ABC 1234",
  },
]

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  motor: "Motor",
  sedan: "Sedan",
  suv: "SUV",
}

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    vehicle: "sedan",
    pickup: LOCATIONS[0],
    dropoff: LOCATIONS[2],
    fare: 215,
    distanceKm: 6.2,
    status: "completed",
    createdAt: "2026-10-06T09:30:00Z",
    completedAt: "2026-10-06T10:05:00Z",
  },
  {
    id: "b2",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    vehicle: "motor",
    pickup: LOCATIONS[4],
    dropoff: LOCATIONS[1],
    fare: 140,
    distanceKm: 5.4,
    status: "completed",
    createdAt: "2026-10-03T14:10:00Z",
    completedAt: "2026-10-03T14:35:00Z",
  },
  {
    id: "b3",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    vehicle: "suv",
    pickup: LOCATIONS[3],
    dropoff: LOCATIONS[6],
    fare: 0,
    distanceKm: 3.1,
    status: "cancelled",
    createdAt: "2026-10-01T18:45:00Z",
  },
]
