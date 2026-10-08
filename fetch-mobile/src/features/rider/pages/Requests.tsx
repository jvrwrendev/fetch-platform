import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import { VEHICLE_LABELS } from "@/data/mock"

export default function Requests() {
  const { user } = useAuth()
  const { bookings, acceptBooking, rejectBooking } = useBookings()
  const open = bookings
    .filter((b) => b.status === "searching")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Available bookings</h1>
      {open.length === 0 && (
        <p className="text-sm text-muted-foreground">No open requests right now.</p>
      )}
      {open.map((b) => (
        <Card key={b.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {b.pickup.name} → {b.dropoff.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {VEHICLE_LABELS[b.vehicle]} · {b.distanceKm} km · ₱{b.fare} · {b.passengerName}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  acceptBooking(b.id, user!.id, user!.name)
                  toast.success("Booking accepted")
                }}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  rejectBooking(b.id)
                  toast("Booking rejected")
                }}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
