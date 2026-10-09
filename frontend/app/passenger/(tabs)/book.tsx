import * as Location from "expo-location"
import { useRouter } from "expo-router"
import { Loader2, MapPin, Navigation } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Pressable, View } from "react-native"

import Stepper from "@/components/Stepper"
import { PageHeader, Screen } from "@/components/layout/Screen"
import TripRouteMap from "@/components/map/TripRouteMap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import {
  LOCATIONS,
  PAYMENT_METHODS,
  VEHICLE_LABELS,
  estimateFare,
  type GeoPoint,
  type PaymentMethod,
  type VehicleType,
} from "@/shared"
import { peso } from "@/utils/format"

const STEPS = ["Pickup", "Drop-off", "Review"]
const VEHICLES: VehicleType[] = ["motor", "sedan", "suv"]
const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
}

export default function BookRide() {
  const { user } = useAuth()
  const { createBooking } = useBookings()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [pickup, setPickup] = useState<GeoPoint | null>(null)
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null)
  const [vehicle, setVehicle] = useState<VehicleType>("sedan")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [locating, setLocating] = useState(false)

  const estimate = useMemo(
    () => (pickup && dropoff ? estimateFare(pickup, dropoff, vehicle) : null),
    [pickup, dropoff, vehicle]
  )

  const choose = (point: GeoPoint) => {
    if (step === 0) {
      setPickup(point)
      setStep(1)
    } else {
      setDropoff(point)
      setStep(2)
    }
  }

  const useCurrentLocation = async () => {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        toast.error("Location permission denied", {
          description: "Pick a pickup from the list instead.",
        })
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      setPickup({
        name: "Current location",
        address: "Your location",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      toast.success("Pickup set to your location")
      setStep(1)
    } catch {
      toast.error("Could not get your location")
    } finally {
      setLocating(false)
    }
  }

  const confirm = () => {
    if (!user || !pickup || !dropoff || !estimate) return
    const booking = createBooking({
      passengerId: user.id,
      passengerName: user.name,
      vehicle,
      pickup,
      dropoff,
      distanceKm: estimate.distanceKm,
      fare: {
        base: estimate.base,
        distance: estimate.distanceCost,
        total: estimate.total,
      },
      paymentMethod,
    })
    toast.success("Ride requested", {
      description: "Looking for a rider nearby…",
    })
    router.push(`/passenger/trip/${booking.id}`)
  }

  const title =
    step === 0 ? "Choose pickup" : step === 1 ? "Choose drop-off" : "Review & confirm"

  return (
    <Screen>
      <PageHeader title="Book a ride" description="Three quick steps." />
      <Stepper steps={STEPS} current={step} onSelect={setStep} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {step < 2 ? (
            <View className="gap-2">
              {step === 0 ? (
                <Button
                  variant="outline"
                  onPress={useCurrentLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <Loader2 size={16} color="#171717" />
                  ) : (
                    <Navigation size={16} color="#171717" />
                  )}
                  <Text className="text-sm font-medium">
                    Use current location
                  </Text>
                </Button>
              ) : null}
              {LOCATIONS.map((location) => (
                <Pressable
                  key={location.name}
                  onPress={() => choose(location)}
                  className="flex-row items-center gap-3 rounded-lg border border-border p-3"
                >
                  <MapPin size={18} color="#737373" />
                  <View className="flex-1">
                    <Text className="text-sm font-medium">
                      {location.name}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {location.address}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View className="gap-4">
              <View className="gap-1">
                <Text className="text-xs text-muted-foreground">Pickup</Text>
                <Text className="text-sm">{pickup?.name}</Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted-foreground">Drop-off</Text>
                <Text className="text-sm">{dropoff?.name}</Text>
              </View>

              <View className="gap-2">
                <Text className="text-xs text-muted-foreground">Vehicle</Text>
                <View className="flex-row gap-2">
                  {VEHICLES.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setVehicle(option)}
                      className={
                        vehicle === option
                          ? "flex-1 items-center rounded-lg border border-primary bg-primary p-3"
                          : "flex-1 items-center rounded-lg border border-border p-3"
                      }
                    >
                      <Text
                        className={
                          vehicle === option
                            ? "text-sm font-medium text-primary-foreground"
                            : "text-sm font-medium"
                        }
                      >
                        {VEHICLE_LABELS[option]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-xs text-muted-foreground">Payment</Text>
                <View className="flex-row gap-2">
                  {PAYMENT_METHODS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => setPaymentMethod(option)}
                      className={
                        paymentMethod === option
                          ? "flex-1 items-center rounded-lg border border-primary bg-primary p-3"
                          : "flex-1 items-center rounded-lg border border-border p-3"
                      }
                    >
                      <Text
                        className={
                          paymentMethod === option
                            ? "text-sm font-medium text-primary-foreground"
                            : "text-sm font-medium"
                        }
                      >
                        {PAYMENT_LABEL[option]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {estimate ? (
                <View className="gap-1.5 rounded-lg bg-muted p-3">
                  <FareRow label="Distance" value={`${estimate.distanceKm} km`} />
                  <FareRow label="Base fare" value={peso(estimate.base)} />
                  <FareRow
                    label="Distance fare"
                    value={peso(estimate.distanceCost)}
                  />
                  {estimate.surgeAdjustment > 0 ? (
                    <FareRow
                      label="Surge"
                      value={peso(estimate.surgeAdjustment)}
                    />
                  ) : null}
                  {estimate.minimumTopUp > 0 ? (
                    <FareRow
                      label="Minimum fare top-up"
                      value={peso(estimate.minimumTopUp)}
                    />
                  ) : null}
                  <FareRow label="Booking fee" value={peso(estimate.bookingFee)} />
                  <View className="mt-1 flex-row items-center justify-between border-t border-border pt-2">
                    <Text className="text-sm font-medium">Estimated fare</Text>
                    <Text className="text-sm font-semibold">
                      {peso(estimate.total)}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View className="flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => setStep(1)}
                >
                  Back
                </Button>
                <Button className="flex-1" onPress={confirm}>
                  Confirm ride
                </Button>
              </View>
            </View>
          )}
        </CardContent>
      </Card>

      {pickup && dropoff ? (
        <TripRouteMap pickup={pickup} dropoff={dropoff} height={220} />
      ) : null}
    </Screen>
  )
}

function FareRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <Text className="text-xs font-medium">{value}</Text>
    </View>
  )
}
