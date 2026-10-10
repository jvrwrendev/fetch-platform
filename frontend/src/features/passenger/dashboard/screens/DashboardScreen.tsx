import { useRouter } from "expo-router"
import { ArrowRight } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ServiceIcon } from "@/components/ServiceIcon"
import { Text } from "@/components/ui/text"
import BookingCard from "@/components/BookingCard"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import {
  BOOKING_TYPES,
  BOOKING_TYPE_DESCRIPTION,
  serviceLabel,
  type BookingType,
} from "@/shared"
import { isTerminal } from "@/services/trip"
import { useThemeColors } from "@/theme"

const SERVICE_LABELS: Record<BookingType, string> = {
  ride: "Book ride",
  pabili: "Pabili",
  padala: serviceLabel("padala", "commuter"),
}

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

      <View className="gap-3">
        {BOOKING_TYPES.map((type) => {
          return (
            <Pressable
              key={type}
              onPress={() =>
                router.push({
                  pathname: "/passenger/booking",
                  params: { type },
                })
              }
              className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <View className="size-10 items-center justify-center rounded-full bg-secondary">
                <ServiceIcon type={type} size={20} color={colors.foreground} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="font-medium">{SERVICE_LABELS[type]}</Text>
                <Text className="text-xs text-muted-foreground">
                  {BOOKING_TYPE_DESCRIPTION[type]}
                </Text>
              </View>
              <ArrowRight size={16} color={colors.mutedForeground} />
            </Pressable>
          )
        })}
      </View>

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
