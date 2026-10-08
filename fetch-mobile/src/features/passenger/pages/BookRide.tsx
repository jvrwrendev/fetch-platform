import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Crosshair, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import Stepper from "@/components/Stepper"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LOCATIONS, VEHICLE_LABELS } from "@/data/mock"
import { estimateFare } from "@/lib/fare"
import type { GeoPoint, VehicleType } from "@/lib/types"
import { useAuth } from "@/features/auth/AuthContext"
import { useBookings } from "@/features/bookings/BookingsContext"
import MapView from "@/features/map/MapView"
import { useRoute } from "@/features/map/useRoute"

const STEPS = ["Pickup", "Drop-off", "Confirm"]

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
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [pickup, setPickup] = useState<GeoPoint | null>(null)
  const [dropoff, setDropoff] = useState<GeoPoint | null>(null)
  const [vehicle, setVehicle] = useState<VehicleType>("sedan")
  const [locating, setLocating] = useState(false)

  const estimate = useMemo(
    () => (pickup && dropoff ? estimateFare(pickup, dropoff, vehicle) : null),
    [pickup, dropoff, vehicle]
  )

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser", {
        description: "Choose a pickup from the list or tap the map instead.",
      })
      return
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      toast.error("Location requires a secure page (HTTPS or localhost)", {
        description: "Choose a pickup from the list or tap the map instead.",
      })
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        setPickup({
          name: "Current location",
          address: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        toast.success("Pickup set to your current location")
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied", {
            description:
              "Allow location for this site in your browser settings, or pick a place below.",
          })
          setPickup((p) => p ?? LOCATIONS[0])
        } else if (err.code === err.TIMEOUT) {
          toast.error("Location request timed out", {
            description: "Try again, or pick a place from the list.",
          })
          setPickup((p) => p ?? LOCATIONS[0])
        } else {
          toast.error("Location unavailable", {
            description: "We couldn't get your GPS position. Pick a place below.",
          })
          setPickup((p) => p ?? LOCATIONS[0])
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleMapClick = (pos: { lat: number; lng: number }) => {
    if (step === 0) setPickup(pinPoint(pos))
    else if (step === 1) setDropoff(pinPoint(pos))
  }

  const markers = useMemo(() => {
    const list = []
    if (pickup)
      list.push({
        position: [pickup.lat, pickup.lng] as [number, number],
        label: "Pickup",
        color: "#16a34a",
        variant: pickup.name === "Current location" ? ("location" as const) : ("dot" as const),
      })
    if (dropoff)
      list.push({
        position: [dropoff.lat, dropoff.lng] as [number, number],
        label: "Drop-off",
        color: "#dc2626",
      })
    return list
  }, [pickup, dropoff])

  const routed = useRoute(pickup, dropoff)
  const straight: [number, number][] =
    pickup && dropoff
      ? [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ]
      : []
  const route = routed ?? straight

  const samePoint =
    pickup && dropoff && pickup.lat === dropoff.lat && pickup.lng === dropoff.lng

  const next = () => {
    if (step === 0 && !pickup) {
      toast.error("Set a pickup — use current location, a preset, or tap the map")
      return
    }
    if (step === 1) {
      if (!dropoff) {
        toast.error("Set a drop-off — choose a preset or tap the map")
        return
      }
      if (samePoint) {
        toast.error("Pickup and drop-off must differ")
        return
      }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const confirm = () => {
    if (!pickup || !dropoff || !estimate) return
    const booking = createBooking({
      passengerId: user!.id,
      passengerName: user!.name,
      vehicle,
      pickup,
      dropoff,
      fare: estimate.fare,
      distanceKm: estimate.distanceKm,
    })
    toast.success("Ride requested — looking for a rider")
    navigate(`/passenger/trip/${booking.id}`)
  }

  const hint =
    step === 0
      ? "Tap the map to drop your pickup pin"
      : step === 1
        ? "Tap the map to drop your drop-off pin"
        : "Review your trip before confirming"

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Book a ride</h1>
      <Stepper steps={STEPS} current={step} onSelect={setStep} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="order-2 md:order-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {step === 0 && "Choose pickup"}
              {step === 1 && "Choose drop-off"}
              {step === 2 && "Review & confirm"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {hint}
            </p>

            {step === 0 && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={useCurrentLocation}
                  disabled={locating}
                >
                  {locating ? (
                    <>
                      <Loader2 className="animate-spin" /> Getting location…
                    </>
                  ) : (
                    <>
                      <Crosshair /> Use my current location
                    </>
                  )}
                </Button>
                <div className="space-y-2">
                  <Label>Popular places</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((l) => (
                      <button
                        key={l.name}
                        type="button"
                        onClick={() => setPickup(l)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          pickup?.name === l.name && pickup?.address === l.address
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
                {pickup && (
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{pickup.name}</p>
                    <p className="text-muted-foreground">{pickup.address}</p>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Popular places</Label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((l) => (
                      <button
                        key={l.name}
                        type="button"
                        onClick={() => setDropoff(l)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          dropoff?.name === l.name && dropoff?.address === l.address
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-background hover:bg-muted"
                        }`}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>
                </div>
                {dropoff ? (
                  <div className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{dropoff.name}</p>
                    <p className="text-muted-foreground">{dropoff.address}</p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                    <MapPin className="mr-1 inline size-4" />
                    No drop-off selected yet
                  </div>
                )}
              </div>
            )}

            {step === 2 && estimate && pickup && dropoff && (
              <div className="space-y-4">
                <div className="space-y-3 rounded-lg border p-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Pickup</span>
                    <span className="text-right font-medium">{pickup.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Drop-off</span>
                    <span className="text-right font-medium">{dropoff.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium">{estimate.distanceKm} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated fare</span>
                    <span className="font-semibold">₱{estimate.fare}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <Select value={vehicle} onValueChange={(v) => setVehicle(v as VehicleType)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(VEHICLE_LABELS) as VehicleType[]).map((v) => (
                        <SelectItem key={v} value={v}>
                          {VEHICLE_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={back}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button className="flex-1" onClick={next}>
                  Next
                </Button>
              ) : (
                <Button className="flex-1" onClick={confirm}>
                  Confirm booking
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="order-1 space-y-2 md:order-2">
          <MapView
            height={360}
            markers={markers}
            route={route}
            onMapClick={handleMapClick}
            markersDraggable
            onMarkerDragEnd={(i, pos) => {
              if (i === 0) setPickup(pinPoint(pos))
              else if (i === 1) setDropoff(pinPoint(pos))
            }}
          />
          <div className="flex flex-wrap gap-3 px-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-3 rounded-full bg-green-600" /> Pickup
            </span>
            <span className="flex items-center gap-1">
              <span className="size-3 rounded-full bg-red-600" /> Drop-off
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
