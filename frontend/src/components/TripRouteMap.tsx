import type { GeoPoint, LatLng } from "@/shared"
import { useRoute } from "@/hooks/useRoute"
import { mapColors } from "@/theme/colors"

import MapView from "./MapView"

interface TripRouteMapProps {
  pickup: GeoPoint
  dropoff: GeoPoint
  rider?: LatLng | null
  height?: number
}

export default function TripRouteMap({
  pickup,
  dropoff,
  rider,
  height = 300,
}: TripRouteMapProps) {
  const routed = useRoute(pickup, dropoff)
  const straight: LatLng[] = [
    { lat: pickup.lat, lng: pickup.lng },
    { lat: dropoff.lat, lng: dropoff.lng },
  ]

  return (
    <MapView
      height={height}
      route={routed ?? straight}
      markers={[
        { lat: pickup.lat, lng: pickup.lng, label: "Pickup", color: mapColors.pickup },
        { lat: dropoff.lat, lng: dropoff.lng, label: "Drop-off", color: mapColors.dropoff },
        ...(rider
          ? [{ lat: rider.lat, lng: rider.lng, label: "Rider", color: mapColors.rider }]
          : []),
      ]}
    />
  )
}
