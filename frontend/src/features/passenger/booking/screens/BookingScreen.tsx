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
import { useSettings, type SavedPlace } from "@/store/SettingsContext"
import { useRoute } from "@/hooks/useRoute"
import { api } from "@convex/_generated/api"
import { useQuery } from "convex/react"
import {
  BOOKING_TYPE_CTA,
  BOOKING_TYPE_DESCRIPTION,
  BOOKING_TYPE_TITLE,
  DEFAULT_FARE_CONFIG,
  LOCATIONS,
  PAYMENT_METHODS,
  estimateFare,
  isInServiceArea,
  resolveBookingType,
  type Booking,
  type BookingErrandItem,
  type BookingType,
  type FareConfig,
  type GeoPoint,
  type PaymentMethod,
} from "@/shared"
import { mapColors } from "@/theme/colors"
import { useThemeColors } from "@/theme"
import { peso } from "@/utils/format"

import { ErrandFields } from "../components/ErrandFields"
import { ServiceTypePicker } from "../components/ServiceTypePicker"

const STEPS_BY_TYPE: Record<BookingType, string[]> = {
  ride: ["Pickup", "Drop-off", "Confirm"],
  pabili: ["Store", "Deliver", "Confirm"],
  padala: ["Pickup", "Deliver", "Confirm"],
}
const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  ewallet: "E-Wallet",
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
  const { settings } = useSettings()
  const router = useRouter()
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>()
  const [bookingType, setBookingType] = useState<BookingType>(() =>
    resolveBookingType(typeParam)
  )
  const [step, setStep] = useState(0)
  const [pickup, setPickup] = useState<GeoPoint | null>(null)
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null)
  const [paymentOverride, setPaymentOverride] = useState<PaymentMethod | null>(
    null
  )
  const [locating, setLocating] = useState(false)
  const [items, setItems] = useState<BookingErrandItem[]>([])
  const [itemBudget, setItemBudget] = useState("")
  const [recipientName, setRecipientName] = useState("")
  const [recipientPhone, setRecipientPhone] = useState("")
  const [notes, setNotes] = useState("")
  const colors = useThemeColors()

  // Quote from the live rate card the admin edits, not a client default.
  const fetchedFareConfig = useQuery(api.admin.getFareConfig)
  const fareConfig = (fetchedFareConfig as FareConfig | undefined) ?? DEFAULT_FARE_CONFIG

  const paymentMethod = paymentOverride ?? settings.defaultPaymentMethod
  const outsidePickup = Boolean(pickup && !isInServiceArea(pickup))
  const outsideDropoff = Boolean(dropoff && !isInServiceArea(dropoff))

  const steps = STEPS_BY_TYPE[bookingType]

  const quote = useMemo(
    () => (pickup && dropoff ? estimateFare(pickup, dropoff, fareConfig) : null),
    [pickup, dropoff, fareConfig]
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
      toast.error(bookingType === "pabili" ? "Set the store" : "Set a pickup", {
        description: "Use your location, a preset, or tap the map.",
      })
      return
    }
    if (step === 1) {
      if (!dropoff) {
        toast.error(
          bookingType === "pabili" ? "Set a delivery point" : "Set a drop-off",
          { description: "Choose a preset or tap the map." }
        )
        return
      }
      if (samePoint) {
        toast.error("Pickup and drop-off must differ")
        return
      }
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const back = () => setStep((prev) => Math.max(prev - 1, 0))

  const confirm = () => {
    if (!user || !pickup || !dropoff || !quote) return

    // Whatever we send is advisory — the server prices the trip itself from
    // the live rate card — but the fare we store mirrors its lines.
    const fare: Booking["fare"] = {
      base: quote.baseFare,
      distance: quote.tier1Charge + quote.tier2Charge,
      total: quote.total,
    }

    const cleanItems = items
      .map((item) => ({ ...item, name: item.name.trim() }))
      .filter((item) => item.name.length > 0)
    const budget = Number(itemBudget)

    const payload: Parameters<typeof createBooking>[0] = {
      passengerId: user.id,
      passengerName: user.name,
      pickup,
      dropoff,
      distanceKm: quote.distanceKm,
      fare,
      paymentMethod,
      bookingType,
    }
    if (bookingType === "pabili") {
      payload.items = cleanItems
      if (budget > 0) payload.itemBudget = budget
    }
    if (bookingType === "padala") {
      if (cleanItems.length > 0) payload.items = cleanItems
      if (recipientName.trim()) payload.recipientName = recipientName.trim()
      if (recipientPhone.trim()) payload.recipientPhone = recipientPhone.trim()
    }
    if (notes.trim()) payload.notes = notes.trim()

    void createBooking(payload)
      .then((booking) => {
        toast.success(
          bookingType === "ride"
            ? "Ride requested"
            : bookingType === "pabili"
              ? "Pabili requested"
              : "Pasugo requested",
          {
            description:
              bookingType === "ride"
                ? "Looking for a rider nearby…"
                : "Looking for a rider to run your errand…",
          }
        )
        router.push({
          pathname: "/passenger/tracking",
          params: { id: booking.id },
        })
      })
      .catch(() => {
        toast.error("Could not create the booking", {
          description: "Check your connection and try again.",
        })
      })
  }

  const hint =
    step === 0
      ? bookingType === "pabili"
        ? "Tap the map to drop the store pin"
        : "Tap the map to drop your pickup pin"
      : step === 1
        ? bookingType === "pabili"
          ? "Tap the map to drop the delivery pin"
          : "Tap the map to drop your drop-off pin"
        : "Review your trip before confirming"

  return (
    <Screen header>
      <PageHeader
        title={BOOKING_TYPE_TITLE[bookingType]}
        description={BOOKING_TYPE_DESCRIPTION[bookingType]}
      />
      <ServiceTypePicker
        value={bookingType}
        onChange={(nextType) => {
          setBookingType(nextType)
          setStep(0)
        }}
      />
      <Stepper steps={steps} current={step} onSelect={setStep} />

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

      {outsidePickup || outsideDropoff ? (
        <View className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
          <Text className="text-xs text-destructive">
            {outsidePickup && outsideDropoff
              ? "Pickup and drop-off are outside"
              : outsidePickup
                ? "Pickup is outside"
                : "Drop-off is outside"}{" "}
            the Malaybalay–Valencia service area. Riders may not be available
            there yet.
          </Text>
        </View>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {step === 0
              ? bookingType === "pabili"
                ? "Choose store"
                : "Choose pickup"
              : step === 1
                ? bookingType === "pabili"
                  ? "Choose delivery point"
                  : "Choose drop-off"
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
                <PlaceChips
                  value={pickup}
                  onSelect={setPickup}
                  saved={settings.savedPlaces}
                />
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
                <PlaceChips
                  value={dropoff}
                  onSelect={setDropoff}
                  saved={settings.savedPlaces}
                />
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

            {step === 2 && quote && pickup && dropoff ? (
              <View className="gap-4">
                <View className="gap-3 rounded-lg border border-border p-3">
                  <FareRow
                    label={bookingType === "pabili" ? "Store" : "Pickup"}
                    value={pickup.name}
                  />
                  <FareRow
                    label={bookingType === "pabili" ? "Deliver to" : "Drop-off"}
                    value={dropoff.name}
                  />
                  <FareRow label="Distance" value={`${quote.distanceKm} km`} />
                  <FareRow label="Billed distance" value={`${quote.billedKm} km`} />
                  <FareRow label="Base fare" value={peso(quote.baseFare)} />
                  {quote.tier1Charge > 0 ? (
                    <FareRow
                      label={`Tier 1 · ${quote.tier1Km} km`}
                      value={peso(quote.tier1Charge)}
                    />
                  ) : null}
                  {quote.tier2Charge > 0 ? (
                    <FareRow
                      label={`Tier 2 · ${quote.tier2Km} km`}
                      value={peso(quote.tier2Charge)}
                    />
                  ) : null}
                  <View className="flex-row items-center justify-between border-t border-border pt-2">
                    <Text className="text-sm text-muted-foreground">
                      Daytime total
                    </Text>
                    <Text className="text-sm font-medium">
                      {peso(quote.daytimeTotal)}
                    </Text>
                  </View>
                  {quote.nightApplied ? (
                    <FareRow
                      label={
                        quote.nightMode === "flat"
                          ? `Night ride · flat +${peso(quote.nightValue)}`
                          : `Night ride · +${quote.nightValue}%`
                      }
                      value={`+${peso(quote.nightSurcharge)}`}
                    />
                  ) : null}
                  <View className="flex-row items-center justify-between border-t border-border pt-2">
                    <Text className="text-sm font-medium">Total fare</Text>
                    <Text className="text-sm font-semibold">
                      {peso(quote.total)}
                    </Text>
                  </View>
                </View>

                {bookingType !== "ride" ? (
                  <ErrandFields
                    type={bookingType}
                    items={items}
                    onItemsChange={setItems}
                    budget={itemBudget}
                    onBudgetChange={setItemBudget}
                    recipientName={recipientName}
                    onRecipientNameChange={setRecipientName}
                    recipientPhone={recipientPhone}
                    onRecipientPhoneChange={setRecipientPhone}
                    notes={notes}
                    onNotesChange={setNotes}
                  />
                ) : null}

                <View className="gap-2">
                  <Text className="text-sm font-medium">Payment</Text>
                  <View className="flex-row gap-2">
                    {PAYMENT_METHODS.map((option) => (
                      <Choice
                        key={option}
                        label={PAYMENT_LABEL[option]}
                        selected={paymentMethod === option}
                        onPress={() => setPaymentOverride(option)}
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
              {step < steps.length - 1 ? (
                <Button className="flex-1" onPress={next}>
                  Next
                </Button>
              ) : (
                <Button className="flex-1" onPress={confirm}>
                  {BOOKING_TYPE_CTA[bookingType]}
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
  saved = [],
}: {
  value: GeoPoint | null
  onSelect: (point: GeoPoint) => void
  saved?: SavedPlace[]
}) {
  return (
    <View className="gap-3">
      {saved.length > 0 ? (
        <View className="gap-2">
          <Text className="text-sm font-medium">Saved places</Text>
          <View className="flex-row flex-wrap gap-2">
            {saved.map((place) => {
              const selected =
                value?.name === place.point.name &&
                value?.address === place.point.address
              return (
                <Pressable
                  key={place.id}
                  onPress={() => onSelect(place.point)}
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
                    {place.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </View>
      ) : null}

      <View className="gap-2">
        <Text className="text-sm font-medium">Popular places</Text>
        <View className="flex-row flex-wrap gap-2">
          {LOCATIONS.map((location) => {
            const selected =
              value?.name === location.name &&
              value?.address === location.address
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
