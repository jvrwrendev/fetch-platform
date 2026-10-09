import type { FareConfig, FareQuote } from "@/lib/types"
import { DEFAULT_FARE_CONFIG } from "@/data/mock/fare"
import { quoteFare } from "@/lib/fare"
import { delay, failure } from "./client"

function validate(config: FareConfig): string | null {
  if (!Number.isFinite(config.base) || config.base < 0) {
    return "Base fare must be zero or greater."
  }
  if (!Number.isFinite(config.perKm) || config.perKm < 0) {
    return "Per-km rate must be zero or greater."
  }
  if (!Number.isFinite(config.bookingFee) || config.bookingFee < 0) {
    return "Booking fee must be zero or greater."
  }
  if (!Number.isFinite(config.minFare) || config.minFare < 0) {
    return "Minimum fare must be zero or greater."
  }
  if (
    !Number.isFinite(config.surgeMultiplier) ||
    config.surgeMultiplier < 1 ||
    config.surgeMultiplier > 3
  ) {
    return "Surge multiplier must be between 1.0 and 3.0."
  }
  return null
}

let currentConfig: FareConfig = structuredClone(DEFAULT_FARE_CONFIG)

export const fareService = {
  async getRates(): Promise<FareConfig> {
    return delay(currentConfig)
  },

  async updateRates(patch: Partial<FareConfig>): Promise<FareConfig> {
    const next: FareConfig = {
      base: patch.base ?? currentConfig.base,
      perKm: patch.perKm ?? currentConfig.perKm,
      bookingFee: patch.bookingFee ?? currentConfig.bookingFee,
      minFare: patch.minFare ?? currentConfig.minFare,
      surgeMultiplier: patch.surgeMultiplier ?? currentConfig.surgeMultiplier,
    }
    const error = validate(next)
    if (error) return failure(error)
    currentConfig = next
    return delay(currentConfig, 300)
  },

  async resetRates(): Promise<FareConfig> {
    currentConfig = structuredClone(DEFAULT_FARE_CONFIG)
    return delay(currentConfig, 200)
  },

  async quote(km: number): Promise<FareQuote> {
    if (!Number.isFinite(km) || km < 0) {
      return failure("Distance must be zero or greater.")
    }
    return delay(quoteFare(currentConfig, km), 150)
  },
}
