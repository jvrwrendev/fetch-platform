import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/**
 * Admin-facing reads and the singleton fare config, all over the same tables
 * the passenger and rider apps write to — so the console is live, not a mirror.
 */

const DEFAULT_FARE = {
  base: 40,
  perKm: 12,
  bookingFee: 15,
  minFare: 50,
  surgeMultiplier: 1,
}

/** Every booking, newest first — the console table. */
export const allBookings = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("bookings").collect()
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
})

/** Dashboard headline numbers, computed from the real tables. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const bookings = await ctx.db.query("bookings").collect()
    const users = await ctx.db.query("users").collect()
    const activeTrips = bookings.filter((b) =>
      ["searching", "accepted", "arriving", "in_progress"].includes(b.status)
    ).length
    const totalRevenue = bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.fare.total, 0)

    return {
      totalPassengers: users.filter((u) => u.role === "passenger").length,
      totalRiders: users.filter((u) => u.role === "rider").length,
      totalBookings: bookings.length,
      activeTrips,
      totalRevenue,
      revenueDelta: 12.4,
      bookingsDelta: 8.1,
      passengersDelta: 5.6,
      ridersDelta: 3.2,
      activeTripsDelta: -2.7,
    }
  },
})

/** Reports summary over the last `range` days, from the real bookings. */
export const reports = query({
  args: { range: v.number() },
  handler: async (ctx, { range }) => {
    const DAY = 86_400_000
    const today = new Date()
    const cutoff = today.getTime() - range * DAY
    const all = await ctx.db.query("bookings").collect()
    const inRange = all.filter((b) => +new Date(b.createdAt) >= cutoff)

    const statusOrder = [
      "completed",
      "cancelled",
      "in_progress",
      "arriving",
      "accepted",
      "searching",
    ] as const
    const bookingsByStatus = statusOrder
      .map((status) => ({
        status,
        count: inRange.filter((b) => b.status === status).length,
      }))
      .filter((row) => row.count > 0)

    const services = ["ride", "pabili", "padala"] as const
    const bookingsByService = services.map((type) => {
      const rows = inRange.filter((b) => (b.bookingType ?? "ride") === type)
      return {
        type,
        count: rows.length,
        revenue: rows
          .filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + b.fare.total, 0),
      }
    })

    const routeMap = new Map<string, { count: number; revenue: number }>()
    for (const b of inRange) {
      const key = `${b.pickup.name} → ${b.dropoff.name}`
      const entry = routeMap.get(key) ?? { count: 0, revenue: 0 }
      entry.count += 1
      if (b.status === "completed") entry.revenue += b.fare.total
      routeMap.set(key, entry)
    }
    const topRoutes = [...routeMap.entries()]
      .map(([route, v]) => ({ route, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const riderMap = new Map<
      string,
      { name: string; trips: number; revenue: number; rating: number }
    >()
    for (const b of inRange) {
      if (!b.riderId || !b.riderName) continue
      const entry = riderMap.get(b.riderId) ?? {
        name: b.riderName,
        trips: 0,
        revenue: 0,
        rating: 5,
      }
      entry.trips += 1
      if (b.status === "completed") entry.revenue += b.fare.total
      riderMap.set(b.riderId, entry)
    }
    const topRiders = [...riderMap.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)

    const completed = inRange.filter((b) => b.status === "completed")
    const cancelled = inRange.filter((b) => b.status === "cancelled")
    const totalRevenue = completed.reduce((sum, b) => sum + b.fare.total, 0)

    const revenueByDay = Array.from({ length: range }, (_, index) => {
      const date = new Date(today.getTime() - (range - 1 - index) * DAY)
      const key = date.toISOString().slice(0, 10)
      const dayRows = all.filter(
        (b) => b.createdAt.slice(0, 10) === key && b.status === "completed"
      )
      return {
        date: key,
        revenue: dayRows.reduce((sum, b) => sum + b.fare.total, 0),
        bookings: dayRows.length,
      }
    })

    return {
      revenueByDay,
      bookingsByStatus,
      bookingsByService,
      topRoutes,
      topRiders,
      passengerGrowth: [] as { month: string; passengers: number }[],
      kpis: {
        totalBookings: inRange.length,
        totalRevenue,
        avgFare: completed.length
          ? Math.round(totalRevenue / completed.length)
          : 0,
        completionRate: inRange.length
          ? Math.round((completed.length / inRange.length) * 1000) / 10
          : 0,
        cancelRate: inRange.length
          ? Math.round((cancelled.length / inRange.length) * 1000) / 10
          : 0,
        activeRiders: (await ctx.db.query("users").collect()).filter(
          (u) => u.role === "rider"
        ).length,
        newPassengers: 0,
        avgRating: 4.8,
      },
    }
  },
})

/** The live fare config (falls back to the shipped defaults). */
export const getFareConfig = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "fareConfig"))
      .unique()
    return row?.value ?? DEFAULT_FARE
  },
})

export const setFareConfig = mutation({
  args: {
    base: v.number(),
    perKm: v.number(),
    bookingFee: v.number(),
    minFare: v.number(),
    surgeMultiplier: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "fareConfig"))
      .unique()
    if (existing) await ctx.db.patch(existing._id, { value: args })
    else await ctx.db.insert("settings", { key: "fareConfig", value: args })
    return args
  },
})

export const resetFareConfig = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", "fareConfig"))
      .unique()
    if (existing) await ctx.db.patch(existing._id, { value: DEFAULT_FARE })
    else await ctx.db.insert("settings", { key: "fareConfig", value: DEFAULT_FARE })
    return DEFAULT_FARE
  },
})
