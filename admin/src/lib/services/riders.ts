import { api } from "@convex/_generated/api"
import { convex } from "@/lib/convex"
import type { Rider, RiderApproval, RiderStatus } from "@/lib/types"
import type { Paginated } from "./passengers"

export interface RiderQuery {
  search?: string
  approval?: RiderApproval | "all"
  status?: RiderStatus | "all"
  sort?: "name" | "trips" | "rating" | "joined"
  sortDir?: "asc" | "desc"
  page: number
  pageSize: number
}

/** Fetch the whole directory, seeding it on a fresh deployment. */
async function allRiders(): Promise<Rider[]> {
  let rows = (await convex.query(api.directory.listRiders)) as Rider[]
  if (rows.length === 0) {
    await convex.mutation(api.directory.seed, {})
    rows = (await convex.query(api.directory.listRiders)) as Rider[]
  }
  return rows
}

export const riderService = {
  async list(query: RiderQuery): Promise<Paginated<Rider>> {
    let rows = [...(await allRiders())]
    const search = query.search?.trim().toLowerCase()

    if (search) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(search) ||
          r.email.toLowerCase().includes(search) ||
          r.phone.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search) ||
          r.vehicle.plateNumber.toLowerCase().includes(search)
      )
    }
    if (query.approval && query.approval !== "all") {
      rows = rows.filter((r) => r.approval === query.approval)
    }
    if (query.status && query.status !== "all") {
      rows = rows.filter((r) => r.status === query.status)
    }

    const dir = query.sortDir === "asc" ? -1 : 1
    rows.sort((a, b) => {
      switch (query.sort) {
        case "name":
          return a.name.localeCompare(b.name) * dir
        case "trips":
          return (b.totalTrips - a.totalTrips) * dir
        case "rating":
          return (b.rating - a.rating) * dir
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

  async setApproval(id: string, approval: RiderApproval): Promise<Rider> {
    const next = await convex.mutation(api.directory.setRiderApproval, {
      id,
      approval,
    })
    if (!next) throw new Error("Rider not found")
    return next as unknown as Rider
  },

  async setStatus(id: string, status: RiderStatus): Promise<Rider> {
    const next = await convex.mutation(api.directory.setRiderStatus, {
      id,
      status,
    })
    if (!next) throw new Error("Rider not found")
    return next as unknown as Rider
  },
}
