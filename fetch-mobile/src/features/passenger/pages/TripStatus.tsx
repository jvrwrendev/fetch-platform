import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBookings } from "@/features/bookings/BookingsContext"
import TripRouteMap from "@/features/map/TripRouteMap"
import { VEHICLE_LABELS } from "@/data/mock"

const STEPS = ["searching", "accepted", "arriving", "in_progress", "completed"] as const

export default function TripStatusPage() {
  const { id } = useParams()
  const { bookings, cancelBooking } = useBookings()
  const booking = bookings.find((b) => b.id === id)

  if (!booking)
    return (
      <div className="space-y-4">
        <p>Trip not found.</p>
        <Link to="/passenger">
          <Button variant="outline">Back home</Button>
        </Link>
      </div>
    )

  const active = !["completed", "cancelled"].includes(booking.status)
  const stepIdx = STEPS.indexOf(booking.status as (typeof STEPS)[number])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Trip status</h1>
      <TripRouteMap pickup={booking.pickup} dropoff={booking.dropoff} />
      <Card>
        <CardHeader>
          <CardTitle className="capitalize">
            {booking.status.replace("_", " ")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="space-y-1">
            {STEPS.map((s, i) => (
              <li key={s} className={`text-sm capitalize ${i <= stepIdx && booking.status !== "cancelled" ? "font-medium" : "text-muted-foreground"}`}>
                {i <= stepIdx && booking.status !== "cancelled" ? "●" : "○"} {s.replace("_", " ")}
              </li>
            ))}
          </ol>
          <div className="text-sm">
            <p>{booking.pickup.name} → {booking.dropoff.name}</p>
            <p className="text-muted-foreground">
              {VEHICLE_LABELS[booking.vehicle]} · {booking.distanceKm} km
            </p>
            {booking.riderName && <p>Rider: {booking.riderName}</p>}
            {booking.fare > 0 && <p className="font-semibold">₱{booking.fare}</p>}
          </div>
          {active && (
            <Button variant="destructive" onClick={() => cancelBooking(booking.id)}>
              Cancel trip
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
