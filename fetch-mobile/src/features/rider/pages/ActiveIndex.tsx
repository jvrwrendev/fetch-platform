import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"

export default function RiderActiveIndex() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const active = bookings.find(
    (b) => b.riderId === user?.id && ["accepted", "arriving", "in_progress"].includes(b.status)
  )
  if (!active)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Active trip</h1>
        <p className="text-sm text-muted-foreground">No active trip right now.</p>
        <Link to="/rider/requests">
          <Button variant="outline">Find requests</Button>
        </Link>
      </div>
    )
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Active trip</h1>
      <p className="text-sm">
        {active.pickup.name} → {active.dropoff.name}
      </p>
      <Link to={`/rider/trip/${active.id}`}>
        <Button>Open trip</Button>
      </Link>
    </div>
  )
}
