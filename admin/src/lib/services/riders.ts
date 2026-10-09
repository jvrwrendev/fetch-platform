import type { Rider, RiderApproval, RiderStatus } from "@/lib/types"
import { RIDERS } from "@/data/mock/generate"
import { delay } from "./client"
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

export const riderService = {
  async list(query: RiderQuery): Promise<Paginated<Rider>> {
    let rows = [...RIDERS]
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
    return delay({ items: rows.slice(start, start + query.pageSize), total, page: query.page, pageSize: query.pageSize })
  },

  async setApproval(id: string, approval: RiderApproval): Promise<Rider> {
    const target = RIDERS.find((r) => r.id === id)
    if (!target) return Promise.reject(new Error("Rider not found"))
    target.approval = approval
    if (approval !== "approved") {
      target.status = "inactive"
      target.availability = "offline"
    }
    return delay(target, 120)
  },

  async setStatus(id: string, status: RiderStatus): Promise<Rider> {
    const target = RIDERS.find((r) => r.id === id)
    if (!target) return Promise.reject(new Error("Rider not found"))
    target.status = status
    if (status !== "active") target.availability = "offline"
    target.lastActiveAt = new Date().toISOString()
    return delay(target, 120)
  },
}
