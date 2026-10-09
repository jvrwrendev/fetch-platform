import type { Booking, BookingType, TripStatus } from "@/lib/types"
import { BOOKINGS } from "@/data/mock/generate"
import { delay } from "./client"
import type { Paginated } from "./passengers"

export interface BookingQuery {
  search?: string
  status?: TripStatus | "all"
  service?: BookingType | "all"
  from?: string
  to?: string
  sort?: "newest" | "oldest" | "fare"
  sortDir?: "asc" | "desc"
  page: number
  pageSize: number
}

export const bookingService = {
  async list(query: BookingQuery): Promise<Paginated<Booking>> {
    let rows = [...BOOKINGS]
    const search = query.search?.trim().toLowerCase()

    if (search) {
      rows = rows.filter(
        (b) =>
          b.reference.toLowerCase().includes(search) ||
          b.passengerName.toLowerCase().includes(search) ||
          (b.riderName ?? "").toLowerCase().includes(search) ||
          b.pickup.name.toLowerCase().includes(search) ||
          b.dropoff.name.toLowerCase().includes(search)
      )
    }
    if (query.status && query.status !== "all") {
      rows = rows.filter((b) => b.status === query.status)
    }
    if (query.service && query.service !== "all") {
      rows = rows.filter((b) => (b.bookingType ?? "ride") === query.service)
    }
    if (query.from) {
      const from = +new Date(query.from)
      rows = rows.filter((b) => +new Date(b.createdAt) >= from)
    }
    if (query.to) {
      const to = +new Date(query.to)
      rows = rows.filter((b) => +new Date(b.createdAt) <= to)
    }

    const dir = query.sortDir === "asc" ? -1 : 1
    rows.sort((a, b) => {
      switch (query.sort) {
        case "oldest":
          return (+new Date(a.createdAt) - +new Date(b.createdAt)) * dir
        case "fare":
          return (b.fare.total - a.fare.total) * dir
        case "newest":
        default:
          return (+new Date(b.createdAt) - +new Date(a.createdAt)) * dir
      }
    })

    const total = rows.length
    const start = (query.page - 1) * query.pageSize
    return delay({ items: rows.slice(start, start + query.pageSize), total, page: query.page, pageSize: query.pageSize })
  },
}
