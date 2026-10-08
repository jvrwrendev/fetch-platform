import { VEHICLE_LABELS } from "@/data/mock"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { Booking } from "@/lib/types"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  searching: "secondary",
  accepted: "default",
  arriving: "default",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
}

export default function TripCard({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-medium">
            {booking.pickup.name} → {booking.dropoff.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {VEHICLE_LABELS[booking.vehicle]} · {booking.distanceKm} km ·{" "}
            {new Date(booking.createdAt).toLocaleDateString()}
          </p>
          {booking.riderName && (
            <p className="text-xs text-muted-foreground">
              Rider: {booking.riderName}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={STATUS_VARIANT[booking.status] ?? "secondary"}>
            {booking.status.replace("_", " ")}
          </Badge>
          {booking.fare > 0 && (
            <span className="text-sm font-semibold">₱{booking.fare}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
