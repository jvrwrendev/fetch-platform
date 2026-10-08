import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookings } from "@/features/bookings/BookingsContext"
import TripRouteMap from "@/features/map/TripRouteMap"

const NEXT: Record<string, { status: "arriving" | "in_progress" | "completed"; label: string } | null> = {
  accepted: { status: "arriving", label: "Arrived at pickup" },
  arriving: { status: "in_progress", label: "Start trip" },
  in_progress: { status: "completed", label: "Complete trip" },
}

export default function RiderTrip() {
  const { id } = useParams()
  const { bookings, setStatus } = useBookings()
  const booking = bookings.find((b) => b.id === id)

  if (!booking)
    return (
      <div className="space-y-4">
        <p>Trip not found.</p>
        <Link to="/rider">
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    )

  const next = NEXT[booking.status]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Active trip</h1>
      <TripRouteMap pickup={booking.pickup} dropoff={booking.dropoff} />
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">{booking.status.replace("_", " ")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>{booking.pickup.name} → {booking.dropoff.name}</p>
          <p className="text-muted-foreground">Passenger: {booking.passengerName}</p>
          <p className="font-semibold">₱{booking.fare}</p>
          {next && (
            <Button onClick={() => setStatus(booking.id, next.status)}>{next.label}</Button>
          )}
          {booking.status === "completed" && (
            <Link to="/rider">
              <Button variant="outline">Done</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
