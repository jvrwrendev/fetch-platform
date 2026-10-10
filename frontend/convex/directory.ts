import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

import { PASSENGERS, RIDERS } from "../../shared/src/index"

/**
 * The passenger/rider directory the admin console browses.
 *
 * Seeded from the shared generator so there is still one source of truth for
 * the demo population; Convex is where it lives at runtime so that edits (a
 * suspension, an approval) persist and are visible to every client.
 */

export const listPassengers = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("passengers").collect()
    return rows.map((row) => row.data)
  },
})

export const listRiders = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("riders").collect()
    return rows.map((row) => row.data)
  },
})

/** Idempotent: fills the directory once, leaves it alone afterwards. */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existingPassengers = await ctx.db.query("passengers").take(1)
    if (existingPassengers.length === 0) {
      for (const passenger of PASSENGERS) {
        await ctx.db.insert("passengers", { id: passenger.id, data: passenger })
      }
    }

    const existingRiders = await ctx.db.query("riders").take(1)
    if (existingRiders.length === 0) {
      for (const rider of RIDERS) {
        await ctx.db.insert("riders", { id: rider.id, data: rider })
      }
    }

    return "directory seeded"
  },
})

export const setPassengerStatus = mutation({
  args: {
    id: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, { id, status }) => {
    const row = await ctx.db
      .query("passengers")
      .withIndex("by_app_id", (q) => q.eq("id", id))
      .unique()
    if (!row) return null
    const data = { ...(row.data as Record<string, unknown>) }
    data.status = status
    data.lastActiveAt = new Date().toISOString()
    await ctx.db.patch(row._id, { data })
    return data
  },
})

export const setRiderApproval = mutation({
  args: {
    id: v.string(),
    approval: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
  },
  handler: async (ctx, { id, approval }) => {
    const row = await ctx.db
      .query("riders")
      .withIndex("by_app_id", (q) => q.eq("id", id))
      .unique()
    if (!row) return null
    const data = { ...(row.data as Record<string, unknown>) }
    data.approval = approval
    if (approval !== "approved") {
      data.status = "inactive"
      data.availability = "offline"
    }
    await ctx.db.patch(row._id, { data })
    return data
  },
})

export const setRiderStatus = mutation({
  args: {
    id: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("suspended")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const row = await ctx.db
      .query("riders")
      .withIndex("by_app_id", (q) => q.eq("id", id))
      .unique()
    if (!row) return null
    const data = { ...(row.data as Record<string, unknown>) }
    data.status = status
    if (status !== "active") data.availability = "offline"
    data.lastActiveAt = new Date().toISOString()
    await ctx.db.patch(row._id, { data })
    return data
  },
})
