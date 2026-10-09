import type { GeoPoint, LatLng } from "@/shared"
import { geocode, reverseGeocode } from "./geocoding"
import { fetchDrivingRoute } from "./routing"

/**
 * The single map/geo surface the app is written against. Swapping in a real
 * provider (Google, Mapbox, …) means implementing this interface only.
 */
export interface MapProvider {
  name: string
  geocode(query: string): Promise<GeoPoint[]>
  reverseGeocode(point: LatLng): Promise<GeoPoint>
  route(from: GeoPoint, to: GeoPoint): Promise<LatLng[] | null>
}

export const mockMapProvider: MapProvider = {
  name: "mock",
  geocode: async (query) => geocode(query),
  reverseGeocode: async (point) => reverseGeocode(point),
  route: (from, to) => fetchDrivingRoute(from, to),
}
