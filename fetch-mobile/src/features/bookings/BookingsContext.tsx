import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { INITIAL_BOOKINGS } from "@/data/mock"
import type { Booking, TripStatus } from "@/lib/types"

interface BookingsContextValue {
  bookings: Booking[]
  createBooking: (b: Omit<Booking, "id" | "createdAt" | "status">) => Booking
  acceptBooking: (id: string, riderId: string, riderName: string) => void
  rejectBooking: (id: string) => void
  setStatus: (id: string, status: TripStatus) => void
  cancelBooking: (id: string) => void
}

const BookingsContext = createContext<BookingsContextValue | null>(null)
const STORAGE_KEY = "fetch_bookings"

function load(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Booking[]) : INITIAL_BOOKINGS
  } catch {
    return INITIAL_BOOKINGS
  }
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(load)

  const createBooking = useCallback(
    (b: Omit<Booking, "id" | "createdAt" | "status">) => {
      const booking: Booking = {
        ...b,
        id: `b${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "searching",
      }
      setBookings((prev) => {
        const next = [booking, ...prev]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
      return booking
    },
    []
  )

  const update = useCallback((id: string, patch: Partial<Booking>) => {
    setBookings((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const acceptBooking = useCallback(
    (id: string, riderId: string, riderName: string) =>
      update(id, { riderId, riderName, status: "accepted" }),
    [update]
  )
  const rejectBooking = useCallback(
    (id: string) => update(id, { status: "cancelled" }),
    [update]
  )
  const setStatus = useCallback(
    (id: string, status: TripStatus) =>
      update(id, {
        status,
        ...(status === "completed"
          ? { completedAt: new Date().toISOString() }
          : {}),
      }),
    [update]
  )
  const cancelBooking = useCallback(
    (id: string) => update(id, { status: "cancelled" }),
    [update]
  )

  const value = useMemo(
    () => ({
      bookings,
      createBooking,
      acceptBooking,
      rejectBooking,
      setStatus,
      cancelBooking,
    }),
    [bookings, createBooking, acceptBooking, rejectBooking, setStatus, cancelBooking]
  )
  return (
    <BookingsContext.Provider value={value}>
      {children}
    </BookingsContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingsContext)
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider")
  return ctx
}
