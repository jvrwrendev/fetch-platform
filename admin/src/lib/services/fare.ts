import { api } from "@convex/_generated/api"
import { convex } from "@/lib/convex"
import { quoteFare } from "@/lib/fare"
import type { FareConfig, FareQuote } from "@/lib/types"
import { failure } from "./client"

function validate(config: FareConfig): string | null {
  if (!Number.isFinite(config.baseFare) || config.baseFare < 0) {
    return "Base fare must be zero or greater."
  }
  if (!Number.isFinite(config.baseDistanceKm) || config.baseDistanceKm <= 0) {
    return "Base distance must be greater than zero."
  }
  if (!Number.isFinite(config.tier1RatePerKm) || config.tier1RatePerKm < 0) {
    return "Tier 1 rate must be zero or greater."
  }
  if (!Number.isFinite(config.tier1MaxKm) || config.tier1MaxKm <= config.baseDistanceKm) {
    return "Tier 1 must end after the base distance."
  }
  if (!Number.isFinite(config.tier2RatePerKm) || config.tier2RatePerKm < 0) {
    return "Tier 2 rate must be zero or greater."
  }
  if (
    !Number.isInteger(config.nightStartHour) ||
    config.nightStartHour < 0 ||
    config.nightStartHour > 23
  ) {
    return "Night start hour must be between 0 and 23."
  }
  if (
    !Number.isInteger(config.nightEndHour) ||
    config.nightEndHour < 0 ||
    config.nightEndHour > 23
  ) {
    return "Night end hour must be between 0 and 23."
  }
  if (
    !Number.isFinite(config.timezoneOffsetHours) ||
    config.timezoneOffsetHours < -12 ||
    config.timezoneOffsetHours > 14
  ) {
    return "Timezone offset must be between -12 and 14."
  }
  if (config.nightMode === "flat") {
    if (!Number.isFinite(config.nightFlatFee) || config.nightFlatFee < 0) {
      return "Night flat fee must be zero or greater."
    }
  } else if (
    !Number.isFinite(config.nightPercent) ||
    config.nightPercent < 0
  ) {
    return "Night percentage must be zero or greater."
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
    const next: FareConfig = { ...current, ...patch }
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

  async quote(km: number, at?: Date | number): Promise<FareQuote> {
    if (!Number.isFinite(km) || km < 0) {
      return failure("Distance must be zero or greater.")
    }
    const config = (await convex.query(api.admin.getFareConfig)) as FareConfig
    return quoteFare(config, km, at)
  },
}
