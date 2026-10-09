import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { Booking } from "@/lib/types"
import { bookingService, type BookingQuery, type Paginated } from "@/lib/services"

interface BookingsContextValue {
  data: Paginated<Booking> | null
  loading: boolean
  error: string | null
  fetchBookings: (query: Omit<BookingQuery, "page" | "pageSize"> & { page: number; pageSize: number }) => void
}

const BookingsContext = createContext<BookingsContextValue | null>(null)

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Paginated<Booking> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(
    (query: Omit<BookingQuery, "page" | "pageSize"> & { page: number; pageSize: number }) => {
      setLoading(true)
      setError(null)
      bookingService
        .list(query)
        .then((result) => setData(result))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load bookings"))
        .finally(() => setLoading(false))
    },
    []
  )

  useEffect(() => {
    fetchBookings({ page: 1, pageSize: 10, sort: "newest" })
  }, [fetchBookings])

  const value = useMemo(
    () => ({ data, loading, error, fetchBookings }),
    [data, loading, error, fetchBookings]
  )

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>
}

export function useBookings(): BookingsContextValue {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider")
  return ctx
}
