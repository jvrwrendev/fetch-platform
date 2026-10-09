import { useRouter } from "expo-router"
import { Navigation } from "lucide-react-native"
import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import { VEHICLE_LABELS } from "@/shared"
import { peso } from "@/utils/format"

export default function RiderActive() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()

  const active = bookings.find(
    (booking) =>
      booking.riderId === user?.id &&
      ["accepted", "arriving", "in_progress"].includes(booking.status)
  )

  if (!active) {
    return (
      <Screen>
        <PageHeader title="Active trip" />
        <View className="items-center gap-3 rounded-xl border border-border bg-card p-8">
          <Navigation size={22} color="#737373" />
          <Text className="text-sm text-muted-foreground">
            No active trip right now.
          </Text>
          <Button
            variant="outline"
            onPress={() => router.push("/rider/requests")}
          >
            Find requests
          </Button>
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      <PageHeader title="Active trip" description={active.reference} />
      <View className="gap-2 rounded-xl border border-border bg-card p-4">
        <Text className="text-sm font-medium">
          {active.pickup.name} → {active.dropoff.name}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {VEHICLE_LABELS[active.vehicle]} · {active.distanceKm} km ·{" "}
          {peso(active.fare.total)}
        </Text>
        <Text className="text-xs capitalize text-muted-foreground">
          {active.status.replace(/_/g, " ")} · {active.passengerName}
        </Text>
      </View>
      <Button onPress={() => router.push(`/rider/trip/${active.id}`)}>
        Open trip
      </Button>
    </Screen>
  )
}
