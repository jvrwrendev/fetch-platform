import { Link } from "react-router-dom"
import { ArrowRight, Plus } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import TripCard from "@/features/bookings/TripCard"

export default function PassengerHome() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const active = bookings.find(
    (b) => b.passengerId === user?.id && ["searching", "accepted", "arriving", "in_progress"].includes(b.status)
  )
  const recent = bookings
    .filter((b) => b.passengerId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hi, {user?.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Where would you like to go?</p>
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold">Book a new ride</p>
            <p className="text-sm opacity-80">
              Fast pickups across Metro Manila
            </p>
          </div>
          <Link to="/passenger/book" className={buttonVariants({ variant: "secondary" })}>
            <Plus /> Book
          </Link>
        </CardContent>
      </Card>

      {active && (
        <Card>
          <CardHeader>
            <CardTitle>Active trip</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm">
              {active.pickup.name} → {active.dropoff.name} ·{" "}
              <span className="capitalize">{active.status.replace("_", " ")}</span>
            </p>
            <Link to={`/passenger/trip/${active.id}`}>
              <Button variant="outline" size="sm">
                View <ArrowRight />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <h2 className="font-semibold">Recent trips</h2>
        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground">No trips yet.</p>
        )}
        {recent.map((b) => (
          <Link key={b.id} to={`/passenger/trip/${b.id}`} className="block">
            <TripCard booking={b} />
          </Link>
        ))}
      </div>
    </div>
  )
}
