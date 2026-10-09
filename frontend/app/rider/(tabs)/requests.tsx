import { useRouter } from "expo-router"
import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import { VEHICLE_LABELS } from "@/shared"
import { peso, shortDate } from "@/utils/format"

export default function RiderRequests() {
  const { user } = useAuth()
  const { bookings, acceptBooking, rejectBooking } = useBookings()
  const router = useRouter()

  const open = bookings
    .filter((booking) => booking.status === "searching")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <Screen>
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
            <CardContent>
              <Text className="text-xs text-muted-foreground">
                {VEHICLE_LABELS[booking.vehicle]} · {booking.distanceKm} km ·{" "}
                {peso(booking.fare.total)} · {shortDate(booking.createdAt)}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Passenger: {booking.passengerName}
              </Text>
              <View className="flex-row gap-2 pt-1">
                <Button
                  className="flex-1"
                  onPress={() => {
                    acceptBooking(booking.id, user!.id, user!.name)
                    toast.success("Request accepted", {
                      description: "Head to the pickup point.",
                    })
                    router.push(`/rider/trip/${booking.id}`)
                  }}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => {
                    rejectBooking(booking.id)
                    toast("Request declined")
                  }}
                >
                  Decline
                </Button>
              </View>
            </CardContent>
          </Card>
        ))
      )}
    </Screen>
  )
}
