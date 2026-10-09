import type { User, VehicleType } from "../types"

/** Seed accounts for the passenger/rider app's mock login. */
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
