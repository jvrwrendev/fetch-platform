import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { ServiceIcon } from "@/components/ServiceIcon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { serviceLabel, VEHICLE_LABEL } from "@/shared"
import { useThemeColors } from "@/theme"
import { peso } from "@/utils/format"

export default function RiderRequests() {
  const { user } = useAuth()
  const { bookings, acceptBooking, rejectBooking } = useBookings()
  const colors = useThemeColors()

  const open = bookings
    .filter((booking) => booking.status === "searching")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const online = Boolean(user?.online)

  if (!online) {
    return (
      <Screen header>
        <PageHeader title="Available bookings" />
        <View className="items-center gap-2 rounded-xl border border-border bg-card p-8">
          <Text className="text-center text-sm font-medium">You are offline</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Go online from the dashboard or settings to see requests.
          </Text>
        </View>
      </Screen>
    )
  }

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
            <CardHeader className="flex-row items-center gap-3 pb-2">
              <View className="size-9 items-center justify-center rounded-full bg-secondary">
                <ServiceIcon
                  type={booking.bookingType ?? "ride"}
                  size={18}
                  color={colors.foreground}
                />
              </View>
              <CardTitle className="flex-1 text-base">
                {booking.pickup.name} → {booking.dropoff.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="gap-3">
              <Text className="text-sm text-muted-foreground">
                {serviceLabel(booking.bookingType, "rider")
                  ? `${serviceLabel(booking.bookingType, "rider")} · `
                  : ""}
                {VEHICLE_LABEL} · {booking.distanceKm} km ·{" "}
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
                    rejectBooking(booking.id, user!.id)
                    toast("Booking declined")
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
