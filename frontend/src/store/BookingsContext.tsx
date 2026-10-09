import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import {
  INITIAL_BOOKINGS,
  USERS,
  type Booking,
  type PaymentMethod,
  type TripStatus,
} from "@/shared"
import { isTerminal, statusAt } from "@/services/mock/simulation"

type NewBookingInput = Omit<
  Booking,
  "id" | "reference" | "createdAt" | "status" | "paymentMethod"
> & {
  paymentMethod?: PaymentMethod
}

interface BookingsContextValue {
  bookings: Booking[]
  /** Clock the ride simulation ticks on; screens use it for ETAs/progress. */
  now: number
  createBooking: (input: NewBookingInput) => Booking
  acceptBooking: (id: string, riderId: string, riderName: string) => void
  rejectBooking: (id: string) => void
  setStatus: (id: string, status: TripStatus) => void
  cancelBooking: (id: string) => void
  rateBooking: (id: string, rating: number) => void
}

const BookingsContext = createContext<BookingsContextValue | null>(null)
const STORAGE_KEY = "fetch_bookings_v2"

const SIM_RIDER = USERS.find((entry) => entry.role === "rider")!

function load(): Booking[] {
  return INITIAL_BOOKINGS
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(load)
  const [now, setNow] = useState(() => Date.now())
  const [hydrated, setHydrated] = useState(false)
  const autopilot = useRef<Set<string>>(new Set())

  useEffect(() => {
    let mounted = true
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (mounted && raw) setBookings(JSON.parse(raw) as Booking[])
      })
      .catch(() => undefined)
      .finally(() => mounted && setHydrated(true))
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  }, [bookings, hydrated])

  // One shared clock drives the mock ride lifecycle and every ETA on screen.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (autopilot.current.size === 0) return
    setBookings((prev) => {
      let changed = false
      const next = prev.map((booking) => {
        if (!autopilot.current.has(booking.id) || isTerminal(booking.status)) {
          return booking
        }
        const status = statusAt(now - new Date(booking.createdAt).getTime())
        if (status === booking.status) return booking
        changed = true
        return {
          ...booking,
          status,
          riderId: booking.riderId ?? SIM_RIDER.id,
          riderName: booking.riderName ?? SIM_RIDER.name,
          completedAt:
            status === "completed"
              ? new Date().toISOString()
              : booking.completedAt,
        }
      })
      return changed ? next : prev
    })
  }, [now])

  const patch = useCallback((id: string, next: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, ...next } : booking
      )
    )
  }, [])

  const createBooking = useCallback((input: NewBookingInput) => {
    const booking: Booking = {
      ...input,
      paymentMethod: input.paymentMethod ?? "cash",
      id: `b${Date.now()}`,
      reference: `FT-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
      status: "searching",
    }
    autopilot.current.add(booking.id)
    setBookings((prev) => [booking, ...prev])
    return booking
  }, [])

  const acceptBooking = useCallback(
    (id: string, riderId: string, riderName: string) => {
      autopilot.current.delete(id)
      patch(id, { riderId, riderName, status: "accepted" })
    },
    [patch]
  )

  const rejectBooking = useCallback(
    (id: string) => {
      autopilot.current.delete(id)
      patch(id, { status: "cancelled" })
    },
    [patch]
  )

  const setStatus = useCallback(
    (id: string, status: TripStatus) => {
      autopilot.current.delete(id)
      patch(id, {
        status,
        ...(status === "completed"
          ? { completedAt: new Date().toISOString() }
          : {}),
      })
    },
    [patch]
  )

  const cancelBooking = useCallback(
    (id: string) => {
      autopilot.current.delete(id)
      patch(id, { status: "cancelled" })
    },
    [patch]
  )

  const rateBooking = useCallback(
    (id: string, rating: number) => patch(id, { rating }),
    [patch]
  )

  const value = useMemo(
    () => ({
      bookings,
      now,
      createBooking,
      acceptBooking,
      rejectBooking,
      setStatus,
      cancelBooking,
      rateBooking,
    }),
    [
      bookings,
      now,
      createBooking,
      acceptBooking,
      rejectBooking,
      setStatus,
      cancelBooking,
      rateBooking,
    ]
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
