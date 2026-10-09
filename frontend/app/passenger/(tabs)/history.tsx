import { useRouter } from "expo-router"
import { History as HistoryIcon } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Text } from "@/components/ui/text"
import TripCard from "@/features/bookings/TripCard"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"

export default function PassengerHistory() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()

  const trips = bookings
    .filter((booking) => booking.passengerId === user?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <Screen header>
      <PageHeader title="Trip history" description={`${trips.length} trips`} />

      {trips.length === 0 ? (
        <View className="items-center gap-2 rounded-xl border border-border bg-card p-8">
          <HistoryIcon size={22} color="#737373" />
          <Text className="text-sm text-muted-foreground">No trips yet.</Text>
        </View>
      ) : (
        trips.map((booking) => (
          <Pressable
            key={booking.id}
            onPress={() => router.push(`/passenger/trip/${booking.id}`)}
          >
            <TripCard booking={booking} />
          </Pressable>
        ))
      )}
    </Screen>
  )
}
