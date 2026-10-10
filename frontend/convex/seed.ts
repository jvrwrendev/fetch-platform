import { mutation } from "./_generated/server"
import type { MutationCtx } from "./_generated/server"

/**
 * Seeds the demo world: the two demo accounts, the Bukidnon motorcycle
 * bookings, a couple of ride chats and the first notifications.
 *
 * `run` is idempotent — safe to call on every boot; `reset` wipes the domain
 * tables and seeds again, for a clean slate while building.
 */

const MALAYBALAY = {
  name: "Malaybalay City",
  address: "Poblacion — provincial capital",
  lat: 8.1550421,
  lng: 125.1305726,
}
const VALENCIA = {
  name: "Valencia City",
  address: "Poblacion, Lumbo",
  lat: 7.9111239,
  lng: 125.0933669,
}
const CAPITOL = {
  name: "Bukidnon Provincial Capitol",
  address: "San Victores St, Barangay 6",
  lat: 8.1560759,
  lng: 125.133532,
}
const BUKSU = {
  name: "Bukidnon State University",
  address: "Fortich St, Barangay 3",
  lat: 8.1563057,
  lng: 125.1239375,
}
const MARKET = {
  name: "Malaybalay Public Market",
  address: "Alvaro Pabillaran St, Barangay 9",
  lat: 8.1475811,
  lng: 125.1335728,
}
const BUS_TERMINAL = {
  name: "Malaybalay Integrated Bus Terminal",
  address: "Barangay 9, Malaybalay City",
  lat: 8.1481091,
  lng: 125.1332734,
}
const VALENCIA_TERMINAL = {
  name: "Valencia City Integrated Transport Terminal",
  address: "Hagkol, Bagontaas, Valencia City",
  lat: 7.9309728,
  lng: 125.098058,
}

const USERS = [
  {
    id: "p1",
    name: "Alex Reyes",
    email: "alex@example.com",
    phone: "+63 917 555 0101",
    role: "passenger" as const,
    rating: 4.8,
    totalTrips: 23,
  },
  {
    id: "r1",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "+63 918 555 0202",
    role: "rider" as const,
    rating: 4.9,
    totalTrips: 312,
    vehicleModel: "Honda Click 160",
    plateNumber: "ABC 1234",
  },
]

const BOOKINGS = [
  {
    reference: "FT-90001",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    pickup: MALAYBALAY,
    dropoff: CAPITOL,
    distanceKm: 6.2,
    fare: { base: 40, distance: 74, total: 129 },
    status: "completed" as const,
    paymentMethod: "cash" as const,
    createdAt: "2026-10-06T09:30:00Z",
    completedAt: "2026-10-06T10:05:00Z",
  },
  {
    reference: "FT-90002",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    pickup: MARKET,
    dropoff: VALENCIA,
    distanceKm: 5.4,
    fare: { base: 40, distance: 65, total: 120 },
    status: "completed" as const,
    paymentMethod: "ewallet" as const,
    createdAt: "2026-10-03T14:10:00Z",
    completedAt: "2026-10-03T14:35:00Z",
  },
  {
    reference: "FT-90003",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    pickup: BUKSU,
    dropoff: VALENCIA_TERMINAL,
    distanceKm: 3.1,
    fare: { base: 40, distance: 37, total: 0 },
    status: "cancelled" as const,
    paymentMethod: "cash" as const,
    createdAt: "2026-10-01T18:45:00Z",
  },
  {
    reference: "FT-90004",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    bookingType: "pabili" as const,
    pickup: MARKET,
    dropoff: MALAYBALAY,
    distanceKm: 2.5,
    fare: { base: 85, distance: 30, total: 130 },
    status: "completed" as const,
    paymentMethod: "ewallet" as const,
    createdAt: "2026-09-29T10:15:00Z",
    completedAt: "2026-09-29T10:48:00Z",
    items: [
      { name: "Pancit canton", qty: 5 },
      { name: "Eggs", qty: 1, note: "1 tray" },
    ],
    itemBudget: 300,
  },
  {
    reference: "FT-90005",
    passengerId: "p1",
    passengerName: "Alex Reyes",
    riderId: "r1",
    riderName: "Maria Santos",
    bookingType: "padala" as const,
    pickup: BUKSU,
    dropoff: BUS_TERMINAL,
    distanceKm: 3.2,
    fare: { base: 85, distance: 38, total: 138 },
    status: "completed" as const,
    paymentMethod: "cash" as const,
    createdAt: "2026-09-26T15:40:00Z",
    completedAt: "2026-09-26T16:12:00Z",
    items: [{ name: "Birthday cake", qty: 1 }],
    recipientName: "Lola Nena",
    recipientPhone: "+63 917 555 0142",
    notes: "Leave with the guard if she's out.",
  },
]

const MESSAGES = [
  {
    bookingRef: "FT-90001",
    senderId: "r1",
    senderName: "Maria Santos",
    body: "I'm on my way, ma'am. See you at the lobby.",
    createdAt: "2026-10-06T09:31:00Z",
  },
  {
    bookingRef: "FT-90001",
    senderId: "p1",
    senderName: "Alex Reyes",
    body: "Okay, I'm waiting by the entrance.",
    createdAt: "2026-10-06T09:33:00Z",
  },
  {
    bookingRef: "FT-90004",
    senderId: "p1",
    senderName: "Alex Reyes",
    body: "Please grab the spicy variant if they have it.",
    createdAt: "2026-09-29T10:16:00Z",
  },
  {
    bookingRef: "FT-90004",
    senderId: "r1",
    senderName: "Maria Santos",
    body: "Got it — buying now, will send a photo.",
    createdAt: "2026-09-29T10:18:00Z",
  },
]

const NOTIFICATIONS = [
  {
    userId: "p1",
    title: "Booking completed",
    message: "FT-90005 was completed by Maria Santos — ₱138.",
    kind: "booking" as const,
    severity: "success" as const,
    read: false,
    createdAt: "2026-09-26T16:12:00Z",
  },
  {
    userId: "p1",
    title: "Rate your ride",
    message: "How was your pabili run with Maria Santos?",
    kind: "booking" as const,
    severity: "info" as const,
    read: true,
    createdAt: "2026-09-29T11:00:00Z",
  },
  {
    userId: "r1",
    title: "Payout settled",
    message: "Your week's earnings were sent to your e-wallet.",
    kind: "system" as const,
    severity: "success" as const,
    read: false,
    createdAt: "2026-10-05T09:00:00Z",
  },
  {
    userId: "r1",
    title: "You are online",
    message: "Requests in Malaybalay and Valencia will reach you.",
    kind: "system" as const,
    severity: "info" as const,
    read: true,
    createdAt: "2026-10-06T06:00:00Z",
  },
]

async function seed(ctx: MutationCtx) {
  for (const user of USERS) {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_app_id", (q) => q.eq("id", user.id))
      .unique()
    if (!existing) await ctx.db.insert("users", user)
  }

  const existingBookings = await ctx.db.query("bookings").take(1)
  if (existingBookings.length === 0) {
    for (const booking of BOOKINGS) {
      await ctx.db.insert("bookings", { id: booking.reference, ...booking })
    }
    const byReference = new Map(BOOKINGS.map((b) => [b.reference, b.reference]))
    for (const [index, message] of MESSAGES.entries()) {
      if (byReference.has(message.bookingRef)) {
        await ctx.db.insert("messages", {
          id: `m${index + 1}`,
          bookingId: message.bookingRef,
          senderId: message.senderId,
          senderName: message.senderName,
          body: message.body,
          createdAt: message.createdAt,
        })
      }
    }
  }

  const existingNotifications = await ctx.db.query("notifications").take(1)
  if (existingNotifications.length === 0) {
    for (const [index, notification] of NOTIFICATIONS.entries()) {
      await ctx.db.insert("notifications", {
        id: `n${index + 1}`,
        ...notification,
      })
    }
  }
}

/** Idempotent: fills anything missing, leaves existing rows alone. */
export const run = mutation({
  args: {},
  handler: async (ctx) => {
    await seed(ctx)
    return "seeded"
  },
})

/** Wipes the domain tables and seeds a fresh demo world. */
export const reset = mutation({
  args: {},
  handler: async (ctx) => {
    for (const table of [
      "bookings",
      "messages",
      "notifications",
      "chatReads",
      "users",
    ] as const) {
      const rows = await ctx.db.query(table).collect()
      for (const row of rows) await ctx.db.delete(row._id)
    }
    await seed(ctx)
    return "reset"
  },
})
