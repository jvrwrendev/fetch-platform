import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import TripRouteMap from "@/components/TripRouteMap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useBookings } from "@/store/BookingsContext"
import {
  pointAlong,
  VEHICLE_LABELS,
  type LatLng,
  type TripStatus,
} from "@/shared"
import { isTerminal, markerProgress, riderOrigin } from "@/services/mock/simulation"
import { peso, statusLabel } from "@/utils/format"

const NEXT: Record<
  string,
  { status: TripStatus; label: string } | undefined
> = {
  accepted: { status: "arriving", label: "Arrived at pickup" },
  arriving: { status: "in_progress", label: "Start trip" },
  in_progress: { status: "completed", label: "Complete trip" },
}

export default function RiderTrip() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { bookings, now, setStatus } = useBookings()

  const booking = bookings.find((entry) => entry.id === id)

  if (!booking) {
    return (
      <Screen>
        <PageHeader title="Trip not found" />
        <Button variant="outline" onPress={() => router.replace("/rider/dashboard")}>
          Back
        </Button>
      </Screen>
    )
  }

  const next = NEXT[booking.status]

  let rider: LatLng | null = null
  if (booking.status === "accepted" || booking.status === "arriving") {
    rider = pointAlong(
      [riderOrigin(booking.pickup), booking.pickup],
      markerProgress(booking, now)
    )
  } else if (booking.status === "in_progress") {
    rider = pointAlong(
      [booking.pickup, booking.dropoff],
      markerProgress(booking, now)
    )
  }

  return (
    <Screen>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => router.replace("/rider/dashboard")}
          className="size-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft size={16} color="#171717" />
        </Pressable>
        <PageHeader
          title="Trip"
          description={booking.reference}
          action={
            <Badge
              variant={
                booking.status === "completed"
                  ? "success"
                  : isTerminal(booking.status)
                    ? "destructive"
                    : "default"
              }
            >
              {statusLabel(booking.status)}
            </Badge>
          }
        />
      </View>

      <TripRouteMap
        pickup={booking.pickup}
        dropoff={booking.dropoff}
        rider={rider}
        height={260}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Trip details</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Passenger" value={booking.passengerName} />
          <Row label="Pickup" value={booking.pickup.name} />
          <Row label="Drop-off" value={booking.dropoff.name} />
          <Row label="Vehicle" value={VEHICLE_LABELS[booking.vehicle]} />
          <Row label="Distance" value={`${booking.distanceKm} km`} />
          <View className="flex-row items-center justify-between border-t border-border pt-2">
            <Text className="text-sm font-medium">Earnings</Text>
            <Text className="text-base font-semibold">
              {peso(booking.fare.total)}
            </Text>
          </View>
        </CardContent>
      </Card>

      {next ? (
        <Button
          onPress={() => {
            setStatus(booking.id, next.status)
            toast.success(
              next.status === "completed" ? "Trip completed" : "Trip updated"
            )
          }}
        >
          {next.label}
        </Button>
      ) : booking.status === "completed" ? (
        <Button variant="outline" onPress={() => router.replace("/rider/dashboard")}>
          Done
        </Button>
      ) : (
        <View className="rounded-xl border border-border bg-card p-4">
          <Text className="text-sm text-muted-foreground">
            This trip was cancelled.
          </Text>
        </View>
      )}
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
