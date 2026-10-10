import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

/** The header bell's list for one account, newest first. */
export const listMine = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
})

export const unreadCount = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
    return rows.filter((row) => !row.read).length
  },
})

export const markAllRead = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect()
    for (const row of rows) {
      if (!row.read) await ctx.db.patch(row._id, { read: true })
    }
    return rows.length
  },
})

export const markRead = mutation({
  args: { id: v.string() },
  handler: async (ctx, { id }) => {
    const row = await ctx.db
      .query("notifications")
      .withIndex("by_app_id", (q) => q.eq("id", id))
      .unique()
    if (!row) return null
    await ctx.db.patch(row._id, { read: true })
    return id
  },
})

/** Used when a trip changes so the other side gets a notice. */
export const push = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    message: v.string(),
    kind: v.union(v.literal("system"), v.literal("booking")),
    severity: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("danger")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    await ctx.db.insert("notifications", {
      id: `n${now}`,
      userId: args.userId,
      title: args.title,
      message: args.message,
      kind: args.kind,
      severity: args.severity,
      read: false,
      createdAt: new Date(now).toISOString(),
    })
    return now
  },
})
