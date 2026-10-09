import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, Star } from "lucide-react-native"
import { useState } from "react"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import TripRouteMap from "@/components/map/TripRouteMap"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useBookings } from "@/features/bookings/BookingsContext"
import {
  pointAlong,
  VEHICLE_LABELS,
  type LatLng,
  type TripStatus,
} from "@/shared"
import {
  etaSeconds,
  isTerminal,
  markerProgress,
  riderOrigin,
} from "@/services/mock/simulation"
import { dateTime, peso, statusLabel } from "@/utils/format"

const STEPS: TripStatus[] = [
  "searching",
  "accepted",
  "arriving",
  "in_progress",
  "completed",
]

const STATUS_VARIANT: Record<
  TripStatus,
  "default" | "secondary" | "outline" | "destructive" | "success"
> = {
  searching: "secondary",
  accepted: "default",
  arriving: "default",
  in_progress: "default",
  completed: "success",
  cancelled: "destructive",
}

export default function TripStatusScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { bookings, now, cancelBooking, rateBooking } = useBookings()
  const [rating, setRating] = useState(0)

  const booking = bookings.find((entry) => entry.id === id)

  if (!booking) {
    return (
      <Screen>
        <PageHeader title="Trip not found" />
        <Button variant="outline" onPress={() => router.replace("/passenger")}>
          Back home
        </Button>
      </Screen>
    )
  }

  const active = !isTerminal(booking.status)
  const stepIndex = STEPS.indexOf(booking.status)
  const eta = etaSeconds(booking, now)

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

  const etaText =
    booking.status === "searching"
      ? "Finding a rider…"
      : booking.status === "arriving"
        ? `Rider arriving in ~${eta}s`
        : booking.status === "in_progress"
          ? `Arriving at drop-off in ~${eta}s`
          : booking.status === "accepted"
            ? "Rider accepted your request"
            : statusLabel(booking.status)

  return (
    <Screen>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => router.replace("/passenger")}
          className="size-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft size={16} color="#171717" />
        </Pressable>
        <PageHeader
          title="Your ride"
          description={booking.reference}
          action={<Badge variant={STATUS_VARIANT[booking.status]}>{booking.status === "in_progress" ? "on trip" : statusLabel(booking.status)}</Badge>}
        />
      </View>

      <Card>
        <CardContent className="pt-5">
          <Text className="text-sm font-medium">{etaText}</Text>
          {booking.riderName ? (
            <Text className="text-xs text-muted-foreground">
              {booking.riderName} · {VEHICLE_LABELS[booking.vehicle]}
            </Text>
          ) : null}
          <View className="mt-3 gap-2">
            {STEPS.map((step, index) => {
              const done = stepIndex >= index && stepIndex !== -1
              const current = stepIndex === index
              return (
                <View key={step} className="flex-row items-center gap-3">
                  <View
                    className={
                      done
                        ? "size-2.5 rounded-full bg-primary"
                        : "size-2.5 rounded-full border border-border"
                    }
                  />
                  <Text
                    className={
                      current
                        ? "text-sm font-medium capitalize"
                        : "text-sm capitalize text-muted-foreground"
                    }
                  >
                    {statusLabel(step)}
                  </Text>
                </View>
              )
            })}
          </View>
        </CardContent>
      </Card>

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
          <Row label="Pickup" value={booking.pickup.name} />
          <Row label="Drop-off" value={booking.dropoff.name} />
          <Row label="Distance" value={`${booking.distanceKm} km`} />
          <Row label="Payment" value={booking.paymentMethod} />
          <Row label="Base fare" value={peso(booking.fare.base)} />
          <Row label="Distance fare" value={peso(booking.fare.distance)} />
          <View className="flex-row items-center justify-between border-t border-border pt-2">
            <Text className="text-sm font-medium">Total</Text>
            <Text className="text-base font-semibold">
              {peso(booking.fare.total)}
            </Text>
          </View>
        </CardContent>
      </Card>

      {active ? (
        <Button
          variant="destructive"
          onPress={() => {
            cancelBooking(booking.id)
            toast("Ride cancelled")
          }}
        >
          Cancel ride
        </Button>
      ) : null}

      {booking.status === "completed" ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receipt</CardTitle>
          </CardHeader>
          <CardContent>
            <Row
              label="Completed"
              value={booking.completedAt ? dateTime(booking.completedAt) : "—"}
            />
            <Row label="Charged" value={peso(booking.fare.total)} />
            <View className="mt-2 gap-2 border-t border-border pt-3">
              <Text className="text-sm font-medium">
                {booking.rating ? "Thanks for rating!" : "Rate your ride"}
              </Text>
              <View className="flex-row gap-2">
                {[1, 2, 3, 4, 5].map((value) => {
                  const active = (booking.rating ?? rating) >= value
                  return (
                    <Pressable
                      key={value}
                      disabled={Boolean(booking.rating)}
                      onPress={() => setRating(value)}
                    >
                      <Star
                        size={26}
                        color={active ? "#f59e0b" : "#a1a1a1"}
                        fill={active ? "#f59e0b" : "transparent"}
                      />
                    </Pressable>
                  )
                })}
              </View>
              {!booking.rating && rating > 0 ? (
                <Button
                  size="sm"
                  onPress={() => {
                    rateBooking(booking.id, rating)
                    toast.success("Rating submitted")
                  }}
                >
                  Submit rating
                </Button>
              ) : null}
            </View>
          </CardContent>
        </Card>
      ) : null}

      {booking.status === "cancelled" ? (
        <View className="rounded-xl border border-border bg-card p-4">
          <Text className="text-sm text-muted-foreground">
            This ride was cancelled.
          </Text>
        </View>
      ) : null}
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium capitalize" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
