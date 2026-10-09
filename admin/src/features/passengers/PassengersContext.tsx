import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Passenger, PassengerStatus } from "@/lib/types"
import { passengerService, type Paginated, type PassengerQuery } from "@/lib/services"

interface PassengersContextValue {
  data: Paginated<Passenger> | null
  loading: boolean
  error: string | null
  fetchPassengers: (query: Omit<PassengerQuery, "page" | "pageSize"> & { page: number; pageSize: number }) => void
  setStatus: (id: string, status: PassengerStatus) => Promise<void>
}

const PassengersContext = createContext<PassengersContextValue | null>(null)

export function PassengersProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Paginated<Passenger> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPassengers = useCallback(
    (query: Omit<PassengerQuery, "page" | "pageSize"> & { page: number; pageSize: number }) => {
      setLoading(true)
      setError(null)
      passengerService
        .list(query)
        .then((result) => setData(result))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load passengers"))
        .finally(() => setLoading(false))
    },
    []
  )

  const setStatus = useCallback(async (id: string, status: PassengerStatus) => {
    await passengerService.setStatus(id, status)
  }, [])

  useEffect(() => {
    fetchPassengers({ page: 1, pageSize: 10 })
  }, [fetchPassengers])

  const value = useMemo(
    () => ({ data, loading, error, fetchPassengers, setStatus }),
    [data, loading, error, fetchPassengers, setStatus]
  )

  return <PassengersContext.Provider value={value}>{children}</PassengersContext.Provider>
}

export function usePassengers(): PassengersContextValue {
  const ctx = useContext(PassengersContext)
  if (!ctx) throw new Error("usePassengers must be used within PassengersProvider")
  return ctx
}
