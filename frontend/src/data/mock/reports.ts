import {
  BOOKINGS,
  PASSENGERS,
  RIDERS,
  type BookingType,
  type DashboardStats,
  type ReportsSummary,
  type RevenuePoint,
  type TripStatus,
} from "@/shared"

// Deterministic "analytics" derived from the shared mock world. Pure and
// synchronous so any screen can compute it without a backend.
const DAY_MS = 86_400_000
const TODAY = new Date("2026-10-08T12:00:00+08:00")

function seededNoise(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function revenueSeries(days: number): RevenuePoint[] {
  const points: RevenuePoint[] = []
  const base = BOOKINGS.filter((b) => b.status !== "cancelled")
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(TODAY.getTime() - i * DAY_MS)
    const weekday = date.getDay()
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.18 : 1
    const noise = 0.72 + seededNoise(i + days) * 0.56
    const sample = base.length > 0 ? base[(i * 7) % base.length]!.fare.total : 180
    const bookings = Math.round((8 + seededNoise(i * 3 + 1) * 18) * weekendBoost * noise)
    const revenue = Math.round(bookings * (sample + 40 + seededNoise(i * 5) * 60))
    points.push({ date: date.toISOString().slice(0, 10), revenue, bookings })
  }
  return points
}

export const DASHBOARD_STATS: DashboardStats = (() => {
  const activeTrips = BOOKINGS.filter((b) =>
    ["searching", "accepted", "arriving", "in_progress"].includes(b.status)
  ).length
  const totalRevenue = BOOKINGS.filter((b) => b.status === "completed").reduce(
    (sum, b) => sum + b.fare.total,
    0
  )
  return {
    totalPassengers: PASSENGERS.length,
    totalRiders: RIDERS.length,
    totalBookings: BOOKINGS.length,
    activeTrips,
    totalRevenue,
    revenueDelta: 12.4,
    bookingsDelta: 8.1,
    passengersDelta: 5.6,
    ridersDelta: 3.2,
    activeTripsDelta: -2.7,
  }
})()

export function buildReports(range = 30): ReportsSummary {
  const revenueByDay = revenueSeries(range)
  const cutoff = TODAY.getTime() - range * DAY_MS
  const inRange = BOOKINGS.filter((b) => +new Date(b.createdAt) >= cutoff)

  const statusOrder: TripStatus[] = [
    "completed",
    "cancelled",
    "in_progress",
    "arriving",
    "accepted",
    "searching",
  ]
  const bookingsByStatus = statusOrder
    .map((status) => ({ status, count: inRange.filter((b) => b.status === status).length }))
    .filter((s) => s.count > 0)

  const services: BookingType[] = ["ride", "pabili", "padala"]
  const bookingsByService = services.map((type) => {
    const rows = inRange.filter((b) => (b.bookingType ?? "ride") === type)
    return {
      type,
      count: rows.length,
      revenue: rows
        .filter((b) => b.status === "completed")
        .reduce((s, b) => s + b.fare.total, 0),
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
      rating: RIDERS.find((r) => r.id === b.riderId)?.rating ?? 5,
    }
    entry.trips += 1
    if (b.status === "completed") entry.revenue += b.fare.total
    riderMap.set(b.riderId, entry)
  }
  const topRiders = [...riderMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  const monthLabels = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"]
  const passengerGrowth = monthLabels.map((month, idx) => ({
    month,
    passengers: Math.round(380 + idx * 118 + seededNoise(idx + 40) * 140),
  }))

  const completed = inRange.filter((b) => b.status === "completed")
  const cancelled = inRange.filter((b) => b.status === "cancelled")
  const totalRevenue = completed.reduce((s, b) => s + b.fare.total, 0)

  return {
    revenueByDay,
    bookingsByStatus,
    bookingsByService,
    topRoutes,
    topRiders,
    passengerGrowth,
    kpis: {
      totalBookings: inRange.length,
      totalRevenue,
      avgFare: completed.length ? Math.round(totalRevenue / completed.length) : 0,
      completionRate: inRange.length
        ? Math.round((completed.length / inRange.length) * 1000) / 10
        : 0,
      cancelRate: inRange.length
        ? Math.round((cancelled.length / inRange.length) * 1000) / 10
        : 0,
      activeRiders: RIDERS.filter((r) => r.status === "active" && r.approval === "approved")
        .length,
      newPassengers: PASSENGERS.filter((p) => +new Date(p.joinedAt) >= cutoff).length,
      avgRating:
        Math.round(
          (RIDERS.reduce((s, r) => s + r.rating, 0) / Math.max(RIDERS.length, 1)) * 10
        ) / 10,
    },
  }
}
