import { useRouter } from "expo-router"
import { ArrowRight, Plus } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import BookingCard from "@/components/BookingCard"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { isTerminal } from "@/services/mock/simulation"
import { useThemeColors } from "@/theme"

export default function PassengerHome() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()
  const colors = useThemeColors()

  const mine = bookings.filter((booking) => booking.passengerId === user?.id)
  const active = mine.find((booking) => !isTerminal(booking.status))
  const recent = [...mine]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  return (
    <Screen header>
      <PageHeader
        title={`Hi, ${user?.name.split(" ")[0] ?? "there"}`}
        description="Where would you like to go?"
      />

      <Card className="bg-primary">
        <CardContent className="flex-row items-center justify-between gap-4 p-5 pt-5">
          <View className="flex-1 gap-0.5">
            <Text className="font-semibold text-primary-foreground">
              Book a new ride
            </Text>
            <Text className="text-sm text-primary-foreground opacity-80">
              Fast pickups across Metro Manila
            </Text>
          </View>
          <Button
            variant="secondary"
            size="sm"
            onPress={() => router.push("/passenger/booking")}
          >
            <Plus size={16} color={colors.secondaryForeground} />
            <Text className="text-sm font-medium text-secondary-foreground">
              Book
            </Text>
          </Button>
        </CardContent>
      </Card>

      {active ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active trip</CardTitle>
          </CardHeader>
          <CardContent className="flex-row items-center justify-between gap-3 pt-0">
            <View className="flex-1 gap-1">
              <Text className="text-sm font-medium" numberOfLines={1}>
                {active.pickup.name} → {active.dropoff.name}
              </Text>
              <Text className="text-xs capitalize text-muted-foreground">
                {active.status.replace(/_/g, " ")}
              </Text>
            </View>
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push({ pathname: "/passenger/tracking", params: { id: active.id } })}
            >
              <Text className="text-sm font-medium">View</Text>
              <ArrowRight size={14} color={colors.foreground} />
            </Button>
          </CardContent>
        </Card>
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
              onPress={() => router.push({ pathname: "/passenger/tracking", params: { id: booking.id } })}
            >
              <BookingCard booking={booking} />
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  )
}
