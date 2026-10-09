import { useRouter } from "expo-router"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Text } from "@/components/ui/text"
import BookingCard from "@/components/BookingCard"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"

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
            <BookingCard booking={booking} />
          </Pressable>
        ))
      )}
    </Screen>
  )
}
