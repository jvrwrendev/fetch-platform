import { useRouter } from "expo-router"
import { ArrowRight, Plus } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import TripCard from "@/features/bookings/TripCard"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import { isTerminal } from "@/services/mock/simulation"

export default function PassengerHome() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()

  const mine = bookings.filter((booking) => booking.passengerId === user?.id)
  const active = mine.find((booking) => !isTerminal(booking.status))
  const recent = [...mine]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  return (
    <Screen>
      <PageHeader
        title={`Hi, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Where would you like to go today?"
      />

      <Button onPress={() => router.push("/passenger/book")}>
        <Plus size={16} color="#fafafa" />
        <Text className="text-sm font-medium text-primary-foreground">
          Book a ride
        </Text>
      </Button>

      {active ? (
        <Pressable onPress={() => router.push(`/passenger/trip/${active.id}`)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trip in progress</CardTitle>
            </CardHeader>
            <CardContent className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-sm font-medium" numberOfLines={1}>
                  {active.pickup.name} → {active.dropoff.name}
                </Text>
                <Text className="text-xs capitalize text-muted-foreground">
                  {active.status.replace(/_/g, " ")}
                </Text>
              </View>
              <ArrowRight size={18} color="#171717" />
            </CardContent>
          </Card>
        </Pressable>
      ) : null}

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-semibold tracking-tight">
            Recent trips
          </Text>
          <Pressable onPress={() => router.push("/passenger/history")}>
            <Text className="text-sm text-muted-foreground">See all</Text>
          </Pressable>
        </View>
        {recent.length === 0 ? (
          <Text className="text-sm text-muted-foreground">No trips yet.</Text>
        ) : (
          recent.map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => router.push(`/passenger/trip/${booking.id}`)}
            >
              <TripCard booking={booking} />
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  )
}
