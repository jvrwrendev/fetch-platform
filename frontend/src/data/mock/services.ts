import { DEFAULT_FARE_CONFIG, VEHICLE_LABELS, type VehicleType } from "@/shared"
import type { RideService } from "@/types/service"

const META: Record<VehicleType, { description: string; capacity: number }> = {
  motor: { description: "Fast and affordable for one passenger", capacity: 1 },
  sedan: { description: "Comfortable air-conditioned car", capacity: 4 },
  suv: { description: "Spacious ride for groups and luggage", capacity: 6 },
}

/** The passenger/rider catalog of bookable ride types, priced from shared. */
export const RIDE_SERVICES: RideService[] = (
  ["motor", "sedan", "suv"] as VehicleType[]
).map((id) => ({
  id,
  name: VEHICLE_LABELS[id],
  base: DEFAULT_FARE_CONFIG.vehicle[id].base,
  perKm: DEFAULT_FARE_CONFIG.vehicle[id].perKm,
  ...META[id],
}))

export function serviceById(id: VehicleType): RideService {
  return RIDE_SERVICES.find((service) => service.id === id)!
}
