import { mutation, query } from "./_generated/server"
import type { MutationCtx, QueryCtx } from "./_generated/server"
import { v } from "convex/values"

const geoPoint = v.object({
  name: v.string(),
  address: v.string(),
  lat: v.number(),
  lng: v.number(),
})

const bookingType = v.union(
  v.literal("ride"),
  v.literal("pabili"),
  v.literal("padala")
)

const tripStatus = v.union(
  v.literal("searching"),
  v.literal("accepted"),
  v.literal("arriving"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("cancelled")
)

const paymentMethod = v.union(v.literal("cash"), v.literal("ewallet"))

const errandItem = v.object({
  name: v.string(),
  qty: v.number(),
  note: v.optional(v.string()),
})

async function find(ctx: MutationCtx | QueryCtx, id: string) {
  return await ctx.db
    .query("bookings")
    .withIndex("by_app_id", (q) => q.eq("id", id))
    .unique()
}

/** A passenger's trips, newest first. */
export const listForPassenger = query({
  args: { passengerId: v.string() },
  handler: async (ctx, { passengerId }) => {
    const rows = await ctx.db
      .query("bookings")
      .withIndex("by_passenger", (q) => q.eq("passengerId", passengerId))
      .collect()
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
})

/** A rider's assigned and completed trips, newest first. */
export const listForRider = query({
  args: { riderId: v.string() },
  handler: async (ctx, { riderId }) => {
    const rows = await ctx.db
      .query("bookings")
      .withIndex("by_rider", (q) => q.eq("riderId", riderId))
      .collect()
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
})

/** Requests nobody has taken yet — the rider's list. */
export const listOpen = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("bookings")
      .withIndex("by_status", (q) => q.eq("status", "searching"))
      .collect()
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },
})

/** A single booking, for the tracking screen's subscription. */
export const get = query({
  args: { id: v.string() },
  handler: async (ctx, { id }) => await find(ctx, id),
})

/** A new request, created by a passenger. */
export const create = mutation({
  args: {
    passengerId: v.string(),
    passengerName: v.string(),
    bookingType: v.optional(bookingType),
    pickup: geoPoint,
    dropoff: geoPoint,
    distanceKm: v.number(),
    fare: v.object({
      base: v.number(),
      distance: v.number(),
      total: v.number(),
    }),
    paymentMethod,
    items: v.optional(v.array(errandItem)),
    itemBudget: v.optional(v.number()),
    notes: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = `b${now}`
    await ctx.db.insert("bookings", {
      ...args,
      id,
      reference: `FT-${String(now).slice(-6)}`,
      status: "searching",
      createdAt: new Date(now).toISOString(),
    })
    return await find(ctx, id)
  },
})

/** The rider takes an open request. */
export const accept = mutation({
  args: { id: v.string(), riderId: v.string(), riderName: v.string() },
  handler: async (ctx, { id, riderId, riderName }) => {
    const booking = await find(ctx, id)
    if (!booking || booking.status !== "searching") return null
    await ctx.db.patch(booking._id, {
      riderId,
      riderName,
      status: "accepted",
    })
    return id
  },
})

/** The rider turns a request down — it leaves their list, cancelled. */
export const reject = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const booking = await find(ctx, id)
    if (!booking) return null
    await ctx.db.patch(booking._id, { status: "cancelled" })
    return id
  },
})

/** Move a trip along its stages. */
export const setStatus = mutation({
  args: { id: v.string(), status: tripStatus },
  handler: async (ctx, { id, status }) => {
    const booking = await find(ctx, id)
    if (!booking) return null
    await ctx.db.patch(booking._id, {
      status,
      ...(status === "completed"
        ? { completedAt: new Date().toISOString() }
        : {}),
    })
    return id
  },
})

/** The passenger cancels their own request. */
export const cancel = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const booking = await find(ctx, id)
    if (!booking) return null
    await ctx.db.patch(booking._id, { status: "cancelled" })
    return id
  },
})

/** The passenger rates a finished trip. */
export const rate = mutation({
  args: { id: v.string(), rating: v.number() },
  handler: async (ctx, { id, rating }) => {
    const booking = await find(ctx, id)
    if (!booking) return null
    await ctx.db.patch(booking._id, { rating })
    return id
  },
})
