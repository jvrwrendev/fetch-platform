import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

const role = v.union(v.literal("passenger"), v.literal("rider"))

/** Every demo account. */
export const list = query({
  args: {},
  handler: async (ctx) => await ctx.db.query("users").collect(),
})

/** The account the demo login should sign in for a given role. */
export const byRole = query({
  args: { role },
  handler: async (ctx, { role }) =>
    await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", role))
      .first(),
})

/** Profile edits from the account panel and settings screens. */
export const update = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    vehicleModel: v.optional(v.string()),
    plateNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_app_id", (q) => q.eq("id", args.id))
      .unique()
    if (!user) return null

    await ctx.db.patch(user._id, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.phone !== undefined ? { phone: args.phone } : {}),
      ...(args.vehicleModel !== undefined
        ? { vehicleModel: args.vehicleModel }
        : {}),
      ...(args.plateNumber !== undefined
        ? { plateNumber: args.plateNumber }
        : {}),
    })
    return args.id
  },
})
