import { api } from "@convex/_generated/api"
import { convex } from "@/lib/convex"
import type { Passenger, PassengerStatus } from "@/lib/types"

export interface PassengerQuery {
  search?: string
  status?: PassengerStatus | "all"
  city?: string | "all"
  sort?: "name" | "trips" | "spend" | "joined"
  sortDir?: "asc" | "desc"
  page: number
  pageSize: number
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/** Fetch the whole directory, seeding it on a fresh deployment. */
async function allPassengers(): Promise<Passenger[]> {
  let rows = (await convex.query(api.directory.listPassengers)) as Passenger[]
  if (rows.length === 0) {
    await convex.mutation(api.directory.seed, {})
    rows = (await convex.query(api.directory.listPassengers)) as Passenger[]
  }
  return rows
}

export const passengerService = {
  async list(query: PassengerQuery): Promise<Paginated<Passenger>> {
    let rows = [...(await allPassengers())]
    const search = query.search?.trim().toLowerCase()

    if (search) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.email.toLowerCase().includes(search) ||
          p.phone.toLowerCase().includes(search) ||
          p.id.toLowerCase().includes(search)
      )
    }
    if (query.status && query.status !== "all") {
      rows = rows.filter((p) => p.status === query.status)
    }
    if (query.city && query.city !== "all") {
      rows = rows.filter((p) => p.city === query.city)
    }

    const dir = query.sortDir === "asc" ? -1 : 1
    rows.sort((a, b) => {
      switch (query.sort) {
        case "name":
          return a.name.localeCompare(b.name) * dir
        case "trips":
          return (b.totalTrips - a.totalTrips) * dir
        case "spend":
          return (b.totalSpend - a.totalSpend) * dir
        case "joined":
          return (+new Date(b.joinedAt) - +new Date(a.joinedAt)) * dir
        default:
          return 0
      }
    })

    const total = rows.length
    const start = (query.page - 1) * query.pageSize
    return {
      items: rows.slice(start, start + query.pageSize),
      total,
      page: query.page,
      pageSize: query.pageSize,
    }
  },

  async setStatus(id: string, status: PassengerStatus): Promise<Passenger> {
    const next = await convex.mutation(api.directory.setPassengerStatus, {
      id,
      status,
    })
    if (!next) throw new Error("Passenger not found")
    return next as unknown as Passenger
  },
}
