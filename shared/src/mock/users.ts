import type { User } from "../types"

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
    vehicleModel: "Honda Click 160",
    plateNumber: "ABC 1234",
  },
]
