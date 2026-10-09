import * as Location from "expo-location"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Crosshair, Loader2, MapPin } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Pressable, View } from "react-native"

import Stepper from "@/components/Stepper"
import { PageHeader, Screen } from "@/components/layout/Screen"
import MapView from "@/components/MapView"
import type { MapMarker } from "@/components/mapTypes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { useRoute } from "@/hooks/useRoute"
import {
  LOCATIONS,
  PAYMENT_METHODS,
  VEHICLE_LABELS,
  estimateFare,
  type GeoPoint,
  type PaymentMethod,
  type VehicleType,
} from "@/shared"
import { mapColors } from "@/theme/colors"
import { useThemeColors } from "@/theme"
import { peso } from "@/utils/format"

const STEPS = ["Pickup", "Drop-off", "Confirm"]
const VEHICLES: VehicleType[] = ["motor", "sedan", "suv"]
const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
}

function pinPoint(pos: { lat: number; lng: number }): GeoPoint {
  return {
    name: "Dropped pin",
    address: `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`,
    lat: pos.lat,
    lng: pos.lng,
  }
}

export default function BookRide() {
  const { user } = useAuth()
  const { createBooking } = useBookings()
  const router = useRouter()
  const { vehicle: vehicleParam } = useLocalSearchParams<{ vehicle?: string }>()
  const initialVehicle = VEHICLES.includes(vehicleParam as VehicleType)
    ? (vehicleParam as VehicleType)
    : "sedan"
  const [step, setStep] = useState(0)
  const [pickup, setPickup] = useState<GeoPoint | null>(null)
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null)
  const [vehicle, setVehicle] = useState<VehicleType>(initialVehicle)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [locating, setLocating] = useState(false)
  const colors = useThemeColors()

  const estimate = useMemo(
    () => (pickup && dropoff ? estimateFare(pickup, dropoff, vehicle) : null),
    [pickup, dropoff, vehicle]
  )

  const markers = useMemo(() => {
    const list: MapMarker[] = []
    if (pickup) {
      list.push({
        lat: pickup.lat,
        lng: pickup.lng,
        label: "Pickup",
        color: mapColors.pickup,
        variant: pickup.name === "Current location" ? "location" : "dot",
      })
    }
    if (dropoff) {
      list.push({
        lat: dropoff.lat,
        lng: dropoff.lng,
        label: "Drop-off",
        color: mapColors.dropoff,
      })
    }
    return list
  }, [pickup, dropoff])

  const routed = useRoute(pickup, dropoff)
  const straight =
    pickup && dropoff
      ? [
          { lat: pickup.lat, lng: pickup.lng },
          { lat: dropoff.lat, lng: dropoff.lng },
        ]
      : []
  const route = routed ?? straight

  const samePoint = Boolean(
    pickup && dropoff && pickup.lat === dropoff.lat && pickup.lng === dropoff.lng
  )

  const useCurrentLocation = async () => {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        toast.error("Location permission denied", {
          description: "Pick a place below, or tap the map instead.",
        })
        setPickup((prev) => prev ?? LOCATIONS[0])
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      setPickup({
        name: "Current location",
        address: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      toast.success("Pickup set to your current location")
    } catch {
      toast.error("Location unavailable", {
        description: "We couldn't get your position. Pick a place below.",
      })
      setPickup((prev) => prev ?? LOCATIONS[0])
    } finally {
      setLocating(false)
    }
  }

  const handleMapClick = (pos: { lat: number; lng: number }) => {
    if (step === 0) setPickup(pinPoint(pos))
    else if (step === 1) setDropoff(pinPoint(pos))
  }

  const next = () => {
    if (step === 0 && !pickup) {
      toast.error("Set a pickup", {
        description: "Use your location, a preset, or tap the map.",
      })
      return
    }
    if (step === 1) {
      if (!dropoff) {
        toast.error("Set a drop-off", {
          description: "Choose a preset or tap the map.",
        })
        return
      }
      if (samePoint) {
        toast.error("Pickup and drop-off must differ")
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const back = () => setStep((prev) => Math.max(prev - 1, 0))

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
    router.push({ pathname: "/passenger/tracking", params: { id: booking.id } })
  }

  const hint =
    step === 0
      ? "Tap the map to drop your pickup pin"
      : step === 1
        ? "Tap the map to drop your drop-off pin"
        : "Review your trip before confirming"

  return (
    <Screen header>
      <PageHeader title="Book a ride" description="Three quick steps." />
      <Stepper steps={STEPS} current={step} onSelect={setStep} />

      <MapView
        height={280}
        markers={markers}
        route={route}
        onMapClick={handleMapClick}
        markersDraggable
        onMarkerDragEnd={(index, pos) => {
          if (index === 0) setPickup(pinPoint(pos))
          else if (index === 1) setDropoff(pinPoint(pos))
        }}
      />

      <View className="flex-row flex-wrap gap-4 px-1">
        <View className="flex-row items-center gap-1.5">
          <View className="size-3 rounded-full bg-[#16a34a]" />
          <Text className="text-xs text-muted-foreground">Pickup</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="size-3 rounded-full bg-[#dc2626]" />
          <Text className="text-xs text-muted-foreground">Drop-off</Text>
        </View>
      </View>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {step === 0
              ? "Choose pickup"
              : step === 1
                ? "Choose drop-off"
                : "Review & confirm"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <View className="gap-4">
            <Text className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {hint}
            </Text>

            {step === 0 ? (
              <View className="gap-4">
                <Button
                  variant="outline"
                  onPress={useCurrentLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <>
                      <Loader2 size={16} color={colors.foreground} />
                      <Text className="text-sm font-medium">
                        Getting location…
                      </Text>
                    </>
                  ) : (
                    <>
                      <Crosshair size={16} color={colors.foreground} />
                      <Text className="text-sm font-medium">
                        Use my current location
                      </Text>
                    </>
                  )}
                </Button>
                <PlaceChips value={pickup} onSelect={setPickup} />
                {pickup ? (
                  <View className="rounded-lg border border-border p-3">
                    <Text className="text-sm font-medium">{pickup.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {pickup.address}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {step === 1 ? (
              <View className="gap-4">
                <PlaceChips value={dropoff} onSelect={setDropoff} />
                {dropoff ? (
                  <View className="rounded-lg border border-border p-3">
                    <Text className="text-sm font-medium">{dropoff.name}</Text>
                    <Text className="text-sm text-muted-foreground">
                      {dropoff.address}
                    </Text>
                  </View>
                ) : (
                  <View className="flex-row items-center gap-1.5 rounded-lg border border-dashed border-border p-3">
                    <MapPin size={14} color={colors.mutedForeground} />
                    <Text className="text-sm text-muted-foreground">
                      No drop-off selected yet
                    </Text>
                  </View>
                )}
              </View>
            ) : null}

            {step === 2 && estimate && pickup && dropoff ? (
              <View className="gap-4">
                <View className="gap-3 rounded-lg border border-border p-3">
                  <FareRow label="Pickup" value={pickup.name} />
                  <FareRow label="Drop-off" value={dropoff.name} />
                  <FareRow label="Distance" value={`${estimate.distanceKm} km`} />
                  <FareRow label="Base fare" value={peso(estimate.base)} />
                  <FareRow
                    label="Distance fare"
                    value={peso(estimate.distanceCost)}
                  />
                  {estimate.surgeAdjustment > 0 ? (
                    <FareRow label="Surge" value={peso(estimate.surgeAdjustment)} />
                  ) : null}
                  {estimate.minimumTopUp > 0 ? (
                    <FareRow
                      label="Minimum fare top-up"
                      value={peso(estimate.minimumTopUp)}
                    />
                  ) : null}
                  <FareRow label="Booking fee" value={peso(estimate.bookingFee)} />
                  <View className="flex-row items-center justify-between border-t border-border pt-2">
                    <Text className="text-sm font-medium">Estimated fare</Text>
                    <Text className="text-sm font-semibold">
                      {peso(estimate.total)}
                    </Text>
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">Vehicle</Text>
                  <View className="flex-row gap-2">
                    {VEHICLES.map((option) => (
                      <Choice
                        key={option}
                        label={VEHICLE_LABELS[option]}
                        selected={vehicle === option}
                        onPress={() => setVehicle(option)}
                      />
                    ))}
                  </View>
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-medium">Payment</Text>
                  <View className="flex-row gap-2">
                    {PAYMENT_METHODS.map((option) => (
                      <Choice
                        key={option}
                        label={PAYMENT_LABEL[option]}
                        selected={paymentMethod === option}
                        onPress={() => setPaymentMethod(option)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

            <View className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onPress={back}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button className="flex-1" onPress={next}>
                  Next
                </Button>
              ) : (
                <Button className="flex-1" onPress={confirm}>
                  Confirm booking
                </Button>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </Screen>
  )
}

function PlaceChips({
  value,
  onSelect,
}: {
  value: GeoPoint | null
  onSelect: (point: GeoPoint) => void
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium">Popular places</Text>
      <View className="flex-row flex-wrap gap-2">
        {LOCATIONS.map((location) => {
          const selected =
            value?.name === location.name && value?.address === location.address
          return (
            <Pressable
              key={location.name}
              onPress={() => onSelect(location)}
              className={
                selected
                  ? "rounded-full border border-primary bg-primary px-3 py-1.5"
                  : "rounded-full border border-border bg-background px-3 py-1.5"
              }
            >
              <Text
                className={
                  selected ? "text-xs text-primary-foreground" : "text-xs"
                }
              >
                {location.name}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={
        selected
          ? "flex-1 items-center rounded-lg border border-primary bg-primary p-3"
          : "flex-1 items-center rounded-lg border border-border p-3"
      }
    >
      <Text
        className={
          selected
            ? "text-sm font-medium text-primary-foreground"
            : "text-sm font-medium"
        }
      >
        {label}
      </Text>
    </Pressable>
  )
}

function FareRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-right text-sm font-medium" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
