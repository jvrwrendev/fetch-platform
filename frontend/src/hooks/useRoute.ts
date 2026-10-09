import { useEffect, useState } from "react"

import type { GeoPoint, LatLng } from "@/shared"
import { fetchDrivingRoute } from "@/services/maps/routing"

export function useRoute(
  from: GeoPoint | null | undefined,
  to: GeoPoint | null | undefined
): LatLng[] | null {
  const [route, setRoute] = useState<LatLng[] | null>(null)

  useEffect(() => {
    let stale = false
    if (!from || !to) {
      setRoute(null)
      return
    }
    setRoute(null)
    fetchDrivingRoute(from, to).then((result) => {
      if (!stale) setRoute(result)
    })
    return () => {
      stale = true
    }
  }, [from, to])

  return route
}
