import { View } from "react-native"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { VEHICLE_LABELS, type Booking, type TripStatus } from "@/shared"
import { peso, shortDate, statusLabel } from "@/utils/format"

const STATUS_VARIANT: Record<
  TripStatus,
  "default" | "secondary" | "outline" | "destructive" | "success"
> = {
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
      <CardContent className="flex-row items-start justify-between gap-4 p-4 pt-4">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-medium" numberOfLines={1}>
            {booking.pickup.name} → {booking.dropoff.name}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {VEHICLE_LABELS[booking.vehicle]} · {booking.distanceKm} km ·{" "}
            {shortDate(booking.createdAt)}
          </Text>
          <Badge variant={STATUS_VARIANT[booking.status]} className="mt-1">
            {statusLabel(booking.status)}
          </Badge>
        </View>
        {booking.fare.total > 0 ? (
          <Text className="text-sm font-semibold">
            {peso(booking.fare.total)}
          </Text>
        ) : null}
      </CardContent>
    </Card>
  )
}
