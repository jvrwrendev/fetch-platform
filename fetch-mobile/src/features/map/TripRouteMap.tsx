import type { GeoPoint } from "@/lib/types"
import MapView from "./MapView"
import { useRoute } from "./useRoute"

interface TripRouteMapProps {
  pickup: GeoPoint
  dropoff: GeoPoint
  height?: number
}

export default function TripRouteMap({
  pickup,
  dropoff,
  height = 320,
}: TripRouteMapProps) {
  const routed = useRoute(pickup, dropoff)
  const straight: [number, number][] = [
    [pickup.lat, pickup.lng],
    [dropoff.lat, dropoff.lng],
  ]
  return (
    <MapView
      height={height}
      markers={[
        { position: [pickup.lat, pickup.lng], label: "Pickup", color: "#16a34a" },
        { position: [dropoff.lat, dropoff.lng], label: "Drop-off", color: "#dc2626" },
      ]}
      route={routed ?? straight}
    />
  )
}
