import type { VehicleType } from "@/shared"

/** A bookable ride type as presented to passengers and riders. */
export interface RideService {
  id: VehicleType
  name: string
  description: string
  capacity: number
  base: number
  perKm: number
}
