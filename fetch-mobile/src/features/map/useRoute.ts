import { useEffect, useState } from "react"
import type { GeoPoint } from "@/lib/types"
import { fetchDrivingRoute } from "./fetchRoute"

type LatLng = [number, number]

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
    fetchDrivingRoute(from, to).then((r) => {
      if (!stale) setRoute(r)
    })
    return () => {
      stale = true
    }
  }, [from, to])

  return route
}
