import { useRouter } from "expo-router"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Text } from "@/components/ui/text"
import TripCard from "@/features/bookings/TripCard"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"

export default function RiderHistory() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()

  const trips = bookings
    .filter((booking) => booking.riderId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <Screen header>
      <PageHeader title="Trip history" description={`${trips.length} trips`} />
      {trips.length === 0 ? (
        <View className="rounded-xl border border-border bg-card p-8">
          <Text className="text-center text-sm text-muted-foreground">
            No trips yet.
          </Text>
        </View>
      ) : (
        trips.map((booking) => (
          <Pressable
            key={booking.id}
            onPress={() => router.push(`/rider/trip/${booking.id}`)}
          >
            <TripCard booking={booking} />
          </Pressable>
        ))
      )}
    </Screen>
  )
}
