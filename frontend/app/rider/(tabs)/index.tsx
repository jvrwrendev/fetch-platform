import { useRouter } from "expo-router"
import { ArrowRight } from "lucide-react-native"
import { useState } from "react"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
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
  const recent = [...mine]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3)

  return (
    <Screen>
      <PageHeader
        title={`Hi, ${user?.name.split(" ")[0] ?? "rider"}`}
        description="Your driving day at a glance."
      />

      <Card>
        <CardContent className="flex-row items-center justify-between pt-5">
          <View className="gap-0.5">
            <Text className="text-sm font-medium">
              {online ? "You're online" : "You're offline"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {online ? "Receiving requests" : "Not receiving requests"}
            </Text>
          </View>
          <Switch
            value={online}
            onValueChange={(value) => {
              setOnline(value)
              toast(value ? "You're online" : "You're offline")
            }}
          />
        </CardContent>
      </Card>

      <View className="flex-row gap-3">
        <Stat label="Completed" value={String(completed.length)} />
        <Stat label="Earnings" value={peso(earnings)} />
      </View>

      {active ? (
        <Pressable onPress={() => router.push(`/rider/trip/${active.id}`)}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active trip</CardTitle>
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
      ) : (
        <Button
          variant="outline"
          onPress={() => router.push("/rider/requests")}
        >
          Find requests
        </Button>
      )}

      <View className="gap-3">
        <Text className="text-lg font-semibold tracking-tight">
          Recent trips
        </Text>
        {recent.length === 0 ? (
          <Text className="text-sm text-muted-foreground">
            No trips assigned yet.
          </Text>
        ) : (
          recent.map((booking) => (
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
        <Text className="text-xl font-semibold">{value}</Text>
      </CardContent>
    </Card>
  )
}
