import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * The FETCH schema, kept in step with `shared/src/types.ts`.
 *
 * Ids are the app's string ids (`p1`, `r1`, booking references) rather than
 * Convex document ids, so the domain types — and every screen that reads them —
 * stay exactly as they are.
 */

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

export default defineSchema({
  /** Demo accounts. Kept by their app ids so login can find them by role. */
  users: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("passenger"), v.literal("rider")),
    rating: v.number(),
    totalTrips: v.number(),
    vehicleModel: v.optional(v.string()),
    plateNumber: v.optional(v.string()),
  })
    .index("by_app_id", ["id"])
    .index("by_role", ["role"]),

  /** Rides, pabili and pasugo — one lifecycle for all three. */
  bookings: defineTable({
    id: v.string(),
    reference: v.string(),
    passengerId: v.string(),
    passengerName: v.string(),
    riderId: v.optional(v.string()),
    riderName: v.optional(v.string()),
    bookingType: v.optional(bookingType),
    pickup: geoPoint,
    dropoff: geoPoint,
    distanceKm: v.number(),
    fare: v.object({
      base: v.number(),
      distance: v.number(),
      total: v.number(),
    }),
    status: tripStatus,
    paymentMethod: paymentMethod,
    createdAt: v.string(),
    completedAt: v.optional(v.string()),
    rating: v.optional(v.number()),
    items: v.optional(v.array(errandItem)),
    itemBudget: v.optional(v.number()),
    notes: v.optional(v.string()),
    recipientName: v.optional(v.string()),
    recipientPhone: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_passenger", ["passengerId"])
    .index("by_rider", ["riderId"])
    .index("by_app_id", ["id"]),

  /** Ride-scoped messages. */
  messages: defineTable({
    id: v.string(),
    bookingId: v.string(),
    senderId: v.string(),
    senderName: v.string(),
    body: v.string(),
    createdAt: v.string(),
  })
    .index("by_booking", ["bookingId"])
    .index("by_app_id", ["id"]),

  /** Per-user notices for the header bell. */
  notifications: defineTable({
    id: v.string(),
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
    read: v.boolean(),
    createdAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_app_id", ["id"]),

  /** Read cursors for chat: the newest message a user has seen per booking. */
  chatReads: defineTable({
    userId: v.string(),
    bookingId: v.string(),
    readAt: v.string(),
  }).index("by_user_booking", ["userId", "bookingId"]),

  /** Singleton platform controls (fare config etc.). */
  settings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index("by_key", ["key"]),

  /**
   * The directory: the broader passenger and rider population the admin
   * console browses. Stored as whole documents (`data`) because these rows are
   * the shared mock's shape, not a second domain model.
   */
  passengers: defineTable({
    id: v.string(),
    data: v.any(),
  }).index("by_app_id", ["id"]),

  riders: defineTable({
    id: v.string(),
    data: v.any(),
  }).index("by_app_id", ["id"]),

  /** Deployment marker used by the health check. */
  appMeta: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
})
