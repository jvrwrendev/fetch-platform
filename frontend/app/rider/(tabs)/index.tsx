import { useRouter } from "expo-router"
import { ArrowRight } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Switch } from "@/components/ui/switch"
import TripCard from "@/features/bookings/TripCard"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import { peso } from "@/utils/format"

export default function RiderDashboard() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()
  const [online, setOnline] = useState(true)

  const mine = bookings.filter((booking) => booking.riderId === user?.id)
  const completed = mine.filter((booking) => booking.status === "completed")
  const earnings = completed.reduce((sum, booking) => sum + booking.fare.total, 0)
  const active = mine.find((booking) =>
    ["accepted", "arriving", "in_progress"].includes(booking.status)
  )
  const requests = useMemo(
    () => bookings.filter((booking) => booking.status === "searching").length,
    [bookings]
  )

  return (
    <Screen header>
      <PageHeader
        title="Rider dashboard"
        description={`${user?.vehicleModel ?? "Vehicle"} · ${user?.plateNumber ?? ""}`}
        action={
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-medium">
              {online ? "Online" : "Offline"}
            </Text>
            <Switch
              value={online}
              onValueChange={setOnline}
            />
          </View>
        }
      />

      <View className="gap-3">
        <View className="flex-row gap-3">
          <Stat label="Earnings" value={peso(earnings)} />
          <Stat label="Completed" value={String(completed.length)} />
        </View>
        <View className="flex-row gap-3">
          <Stat label="Open requests" value={String(requests)} />
          <Stat label="Rating" value={String(user?.rating ?? "—")} />
        </View>
      </View>

      {active ? (
        <Pressable onPress={() => router.push(`/rider/trip/${active.id}`)}>
          <Card>
            <CardContent className="flex-row items-center justify-between gap-3 pt-5">
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

      <Button onPress={() => router.push("/rider/requests")}>
        View requests
      </Button>

      <View className="gap-3">
        <Text className="text-lg font-semibold tracking-tight">
          Recent trips
        </Text>
        {completed.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            No trips assigned yet.
          </Text>
        ) : (
          completed.slice(0, 3).map((booking) => (
            <Pressable
              key={booking.id}
              onPress={() => router.push(`/rider/trip/${booking.id}`)}
            >
              <TripCard booking={booking} />
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="flex-1">
      <CardContent className="gap-1 p-4 pt-4">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-xl font-bold">{value}</Text>
      </CardContent>
    </Card>
  )
}
