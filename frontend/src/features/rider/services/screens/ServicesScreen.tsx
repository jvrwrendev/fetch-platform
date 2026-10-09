import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { serviceLabel, VEHICLE_LABELS } from "@/shared"
import { peso } from "@/utils/format"

export default function RiderRequests() {
  const { user } = useAuth()
  const { bookings, acceptBooking, rejectBooking } = useBookings()

  const open = bookings
    .filter((booking) => booking.status === "searching")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <Screen header>
      <PageHeader
        title="Available bookings"
        description={`${open.length} open right now`}
      />

      {open.length === 0 ? (
        <View className="rounded-xl border border-border bg-card p-8">
          <Text className="text-center text-sm text-muted-foreground">
            No open requests right now.
          </Text>
        </View>
      ) : (
        open.map((booking) => (
          <Card key={booking.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {booking.pickup.name} → {booking.dropoff.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Text className="text-sm text-muted-foreground">
                {serviceLabel(booking.bookingType, "rider")
                  ? `${serviceLabel(booking.bookingType, "rider")} · `
                  : ""}
                {VEHICLE_LABELS[booking.vehicle]} · {booking.distanceKm} km ·{" "}
                {peso(booking.fare.total)} · {booking.passengerName}
              </Text>
              {booking.items?.length ? (
                <Text className="text-xs text-muted-foreground">
                  {booking.items
                    .map((item) => `${item.qty}× ${item.name}`)
                    .join(", ")}
                </Text>
              ) : null}
              {booking.recipientName ? (
                <Text className="text-xs text-muted-foreground">
                  To {booking.recipientName}
                  {booking.recipientPhone ? ` · ${booking.recipientPhone}` : ""}
                </Text>
              ) : null}
              <View className="flex-row gap-2">
                <Button
                  onPress={() => {
                    acceptBooking(booking.id, user!.id, user!.name)
                    toast.success("Booking accepted")
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onPress={() => {
                    rejectBooking(booking.id)
                    toast("Booking rejected")
                  }}
                >
                  Reject
                </Button>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </Screen>
  )
}
