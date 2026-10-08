import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import TripCard from "@/features/bookings/TripCard"

export default function RiderHistory() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const trips = bookings
    .filter((b) => b.riderId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trip history</h1>
      {trips.length === 0 && (
        <p className="text-sm text-muted-foreground">No trips yet.</p>
      )}
      {trips.map((b) => (
        <TripCard key={b.id} booking={b} />
      ))}
    </div>
  )
}
