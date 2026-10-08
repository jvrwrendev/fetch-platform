import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import TripCard from "@/features/bookings/TripCard"

export default function RiderDashboard() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const [online, setOnline] = useState(true)

  const mine = bookings.filter((b) => b.riderId === user?.id)
  const completed = mine.filter((b) => b.status === "completed")
  const earnings = completed.reduce((s, b) => s + b.fare, 0)
  const active = bookings.find(
    (b) => b.riderId === user?.id && ["accepted", "arriving", "in_progress"].includes(b.status)
  )
  const requests = useMemo(
    () => bookings.filter((b) => b.status === "searching").length,
    [bookings]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rider dashboard</h1>
          <p className="text-muted-foreground">{user?.vehicleModel} · {user?.plateNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="online">{online ? "Online" : "Offline"}</Label>
          <Switch id="online" checked={online} onCheckedChange={setOnline} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Earnings" value={`₱${earnings}`} />
        <Stat label="Completed" value={String(completed.length)} />
        <Stat label="Open requests" value={String(requests)} />
        <Stat label="Rating" value={String(user?.rating)} />
      </div>

      {active && (
        <Card>
          <CardHeader><CardTitle>Active trip</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm">{active.pickup.name} → {active.dropoff.name}</p>
            <Link to={`/rider/trip/${active.id}`}>
              <Button variant="outline" size="sm">View <ArrowRight /></Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Link to="/rider/requests" className={buttonVariants()}>View requests</Link>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold">Recent trips</h2>
        {completed.slice(0, 3).map((b) => (
          <TripCard key={b.id} booking={b} />
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
