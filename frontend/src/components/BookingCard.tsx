import { View } from "react-native"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { VEHICLE_LABEL, serviceLabel, type Booking } from "@/shared"
import { peso, shortDate } from "@/utils/format"
import { StatusBadge } from "@/components/StatusBadge"

export default function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card>
      <CardContent className="flex-row items-start justify-between gap-4 p-4 pt-4">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-medium" numberOfLines={1}>
            {booking.pickup.name} → {booking.dropoff.name}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {VEHICLE_LABEL} · {booking.distanceKm} km ·{" "}
            {shortDate(booking.createdAt)}
          </Text>
          {booking.riderName ? (
            <Text className="text-xs text-muted-foreground">
              Rider: {booking.riderName}
            </Text>
          ) : null}
          <View className="mt-1 flex-row items-center gap-2">
            <StatusBadge status={booking.status} />
            {serviceLabel(booking.bookingType, "commuter") ? (
              <Badge variant="secondary">
                {serviceLabel(booking.bookingType, "commuter")}
              </Badge>
            ) : null}
          </View>
        </View>
        {booking.fare.total > 0 ? (
          <Text className="text-sm font-semibold">{peso(booking.fare.total)}</Text>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { BookingCard }
