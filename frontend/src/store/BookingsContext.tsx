import { useMutation, useQuery } from "convex/react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { api } from "@convex/_generated/api"
import type { Booking, PaymentMethod, TripStatus } from "@/shared"
import { useAuth } from "@/store/AuthContext"

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
  loading: boolean
  createBooking: (input: NewBookingInput) => Promise<Booking>
  acceptBooking: (id: string, riderId: string, riderName: string) => void
  rejectBooking: (id: string, riderId: string) => void
  setStatus: (id: string, status: TripStatus) => void
  cancelBooking: (id: string) => void
  rateBooking: (id: string, rating: number) => void
}

const BookingsContext = createContext<BookingsContextValue | null>(null)

/** Convex rows carry `_id`/`_creationTime`; the domain type does not. */
function toBooking(doc: unknown): Booking {
  return doc as Booking
}

export function BookingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [now, setNow] = useState(() => Date.now())

  const isPassenger = user?.role === "passenger"
  const isRider = user?.role === "rider"

  // A passenger sees their trips; a rider sees their assigned trips plus the
  // open request pool. Both streams are live — no polling.
  const passengerRows = useQuery(
    api.bookings.listForPassenger,
    isPassenger && user ? { passengerId: user.id } : "skip"
  )
  const riderRows = useQuery(
    api.bookings.listForRider,
    isRider && user ? { riderId: user.id } : "skip"
  )
  const openRows = useQuery(
    api.bookings.listOpen,
    isRider && user ? { riderId: user.id } : "skip"
  )

  const create = useMutation(api.bookings.create)
  const accept = useMutation(api.bookings.accept)
  const reject = useMutation(api.bookings.reject)
  const setStatusMutation = useMutation(api.bookings.setStatus)
  const cancel = useMutation(api.bookings.cancel)
  const rate = useMutation(api.bookings.rate)
  const seed = useMutation(api.seed.run)

  // Make sure a fresh deployment has the demo world before anything reads it.
  useEffect(() => {
    void seed({}).catch(() => undefined)
  }, [seed])

  // One shared clock keeps the mock map marker animating.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const bookings = useMemo(() => {
    if (user?.role === "passenger") {
      return (passengerRows ?? []).map(toBooking)
    }
    if (user?.role === "rider") {
      const assigned = (riderRows ?? []).map(toBooking)
      const open = (openRows ?? []).map(toBooking)
      const seen = new Set(assigned.map((booking) => booking.id))
      return [...assigned, ...open.filter((booking) => !seen.has(booking.id))]
    }
    return []
  }, [user?.role, passengerRows, riderRows, openRows])

  const loading =
    Boolean(user) &&
    ((isPassenger && passengerRows === undefined) ||
      (isRider && (riderRows === undefined || openRows === undefined)))

  const createBooking = useCallback(
    async (input: NewBookingInput): Promise<Booking> => {
      const created = await create({
        passengerId: input.passengerId,
        passengerName: input.passengerName,
        bookingType: input.bookingType,
        pickup: input.pickup,
        dropoff: input.dropoff,
        paymentMethod: input.paymentMethod ?? "cash",
        items: input.items,
        itemBudget: input.itemBudget,
        notes: input.notes,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
      })
      if (!created) throw new Error("Booking was not created")
      return toBooking(created)
    },
    [create]
  )

  const acceptBooking = useCallback(
    (id: string, riderId: string, riderName: string) => {
      void accept({ id, riderId, riderName })
    },
    [accept]
  )

  const rejectBooking = useCallback(
    (id: string, riderId: string) => {
      void reject({ id, riderId })
    },
    [reject]
  )

  const setStatus = useCallback(
    (id: string, status: TripStatus) => {
      void setStatusMutation({ id, status })
    },
    [setStatusMutation]
  )

  const cancelBooking = useCallback(
    (id: string) => {
      void cancel({ id })
    },
    [cancel]
  )

  const rateBooking = useCallback(
    (id: string, rating: number) => {
      void rate({ id, rating })
    },
    [rate]
  )

  const value = useMemo(
    () => ({
      bookings,
      now,
      loading,
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
      loading,
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
