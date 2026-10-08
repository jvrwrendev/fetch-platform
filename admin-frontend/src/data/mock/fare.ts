import type { FareConfig } from "@/lib/types"

export const DEFAULT_FARE_CONFIG: FareConfig = {
  vehicle: {
    motor: { base: 40, perKm: 12 },
    sedan: { base: 60, perKm: 18 },
    suv: { base: 90, perKm: 25 },
  },
  bookingFee: 15,
  minFare: 50,
  surgeMultiplier: 1,
}

export const SURGE_MIN = 1
export const SURGE_MAX = 3
export const SURGE_STEP = 0.1
