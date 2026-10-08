import { Link } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import TripCard from "@/features/bookings/TripCard"

export default function PassengerHistory() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const trips = bookings
    .filter((b) => b.passengerId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trip history</h1>
      {trips.length === 0 && (
        <p className="text-sm text-muted-foreground">No trips yet.</p>
      )}
      {trips.map((b) => (
        <Link key={b.id} to={`/passenger/trip/${b.id}`} className="block">
          <TripCard booking={b} />
        </Link>
      ))}
    </div>
  )
}
