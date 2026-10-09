import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Rider, RiderApproval, RiderStatus } from "@/lib/types"
import { riderService, type Paginated, type RiderQuery } from "@/lib/services"

interface RidersContextValue {
  data: Paginated<Rider> | null
  loading: boolean
  error: string | null
  fetchRiders: (query: Omit<RiderQuery, "page" | "pageSize"> & { page: number; pageSize: number }) => void
  setApproval: (id: string, approval: RiderApproval) => Promise<void>
  setStatus: (id: string, status: RiderStatus) => Promise<void>
}

const RidersContext = createContext<RidersContextValue | null>(null)

export function RidersProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Paginated<Rider> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRiders = useCallback(
    (query: Omit<RiderQuery, "page" | "pageSize"> & { page: number; pageSize: number }) => {
      setLoading(true)
      setError(null)
      riderService
        .list(query)
        .then((result) => setData(result))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load riders"))
        .finally(() => setLoading(false))
    },
    []
  )

  const setApproval = useCallback(async (id: string, approval: RiderApproval) => {
    await riderService.setApproval(id, approval)
  }, [])

  const setStatus = useCallback(async (id: string, status: RiderStatus) => {
    await riderService.setStatus(id, status)
  }, [])

  useEffect(() => {
    fetchRiders({ page: 1, pageSize: 10 })
  }, [fetchRiders])

  const value = useMemo(
    () => ({ data, loading, error, fetchRiders, setApproval, setStatus }),
    [data, loading, error, fetchRiders, setApproval, setStatus]
  )

  return <RidersContext.Provider value={value}>{children}</RidersContext.Provider>
}

export function useRiders(): RidersContextValue {
  const ctx = useContext(RidersContext)
  if (!ctx) throw new Error("useRiders must be used within RidersProvider")
  return ctx
}
