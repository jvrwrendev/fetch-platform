import { api } from "@convex/_generated/api"
import { convex } from "@/lib/convex"
import { quoteFare } from "@/lib/fare"
import type { FareConfig, FareQuote } from "@/lib/types"
import { failure } from "./client"

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

/** The rate card lives in Convex, so an edit here is platform-wide. */
export const fareService = {
  async getRates(): Promise<FareConfig> {
    return (await convex.query(api.admin.getFareConfig)) as FareConfig
  },

  async updateRates(patch: Partial<FareConfig>): Promise<FareConfig> {
    const current = (await convex.query(api.admin.getFareConfig)) as FareConfig
    const next: FareConfig = {
      base: patch.base ?? current.base,
      perKm: patch.perKm ?? current.perKm,
      bookingFee: patch.bookingFee ?? current.bookingFee,
      minFare: patch.minFare ?? current.minFare,
      surgeMultiplier: patch.surgeMultiplier ?? current.surgeMultiplier,
    }
    const error = validate(next)
    if (error) return failure(error)
    return (await convex.mutation(api.admin.setFareConfig, next)) as FareConfig
  },

  async resetRates(): Promise<FareConfig> {
    return (await convex.mutation(
      api.admin.resetFareConfig,
      {}
    )) as FareConfig
  },

  async quote(km: number): Promise<FareQuote> {
    if (!Number.isFinite(km) || km < 0) {
      return failure("Distance must be zero or greater.")
    }
    const config = (await convex.query(api.admin.getFareConfig)) as FareConfig
    return quoteFare(config, km)
  },
}
