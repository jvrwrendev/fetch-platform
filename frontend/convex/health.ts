import { mutation, query } from "./_generated/server"

/** Reads back the marker `writePing` sets, so a round-trip is provable. */
export const ping = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db
      .query("appMeta")
      .withIndex("by_key", (q) => q.eq("key", "ping"))
      .unique()
    return row?.value ?? "unseeded"
  },
})

/** Writes the round-trip marker. */
export const writePing = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("appMeta")
      .withIndex("by_key", (q) => q.eq("key", "ping"))
      .unique()
    const value = new Date().toISOString()
    if (existing) {
      await ctx.db.patch(existing._id, { value })
    } else {
      await ctx.db.insert("appMeta", { key: "ping", value })
    }
    return value
  },
})
