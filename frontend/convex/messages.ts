import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/** Every message across the rides this account is in, oldest first. */
export const listForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const asPassenger = await ctx.db
      .query("bookings")
      .withIndex("by_passenger", (q) => q.eq("passengerId", userId))
      .collect()
    const asRider = await ctx.db
      .query("bookings")
      .withIndex("by_rider", (q) => q.eq("riderId", userId))
      .collect()
    const ids = new Set([...asPassenger, ...asRider].map((b) => b.id))

    const all = await ctx.db.query("messages").collect()
    return all
      .filter((message) => ids.has(message.bookingId))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },
})

/** One ride's thread, oldest first. */
export const listForBooking = query({
  args: { bookingId: v.string() },
  handler: async (ctx, { bookingId }) => {
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
      .collect()
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  },
})

export const send = mutation({
  args: {
    bookingId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const body = args.body.trim()
    if (!body) return null
    const now = Date.now()
    const id = `m${now}`
    await ctx.db.insert("messages", {
      id,
      bookingId: args.bookingId,
      senderId: args.senderId,
      senderName: args.senderName,
      body,
      createdAt: new Date(now).toISOString(),
    })
    return id
  },
})

/** Read cursors for this account, so the list can show unread dots. */
export const readCursors = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) =>
    await ctx.db
      .query("chatReads")
      .withIndex("by_user_booking", (q) => q.eq("userId", userId))
      .collect(),
})

export const markRead = mutation({
  args: { userId: v.string(), bookingId: v.string() },
  handler: async (ctx, { userId, bookingId }) => {
    const existing = await ctx.db
      .query("chatReads")
      .withIndex("by_user_booking", (q) =>
        q.eq("userId", userId).eq("bookingId", bookingId)
      )
      .unique()
    const readAt = new Date().toISOString()
    if (existing) await ctx.db.patch(existing._id, { readAt })
    else await ctx.db.insert("chatReads", { userId, bookingId, readAt })
    return readAt
  },
})
