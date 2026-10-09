/**
 * Operating region: Bukidnon, Philippines.
 *
 * FETCH is deployed for Bukidnon riders and commuters, so every default the
 * product ships — map centre, search bias, quick-pick places — comes from here
 * instead of being scattered through the UI.
 *
 * The coordinates are real OpenStreetMap data. They were resolved against
 * Nominatim, and each place keeps its OSM object id so it can be re-checked at
 * https://www.openstreetmap.org/<osmId>.
 */

export interface RegionPoint {
  lat: number
  lng: number
}

export const REGION = {
  id: "bukidnon",
  name: "Bukidnon",
  country: "Philippines",
  countryCode: "ph",
  /** Provincial capital. */
  center: { lat: 8.1550421, lng: 125.1305726 } satisfies RegionPoint,
  /** Wide enough to show the whole province on first load. */
  zoom: 10,
  /** Bounding box covering the province, with a small margin. */
  bounds: {
    minLat: 7.35,
    maxLat: 8.62,
    minLng: 124.35,
    maxLng: 125.6,
  },
  /** Shown in the UI wherever a locality name is needed. */
  localityLabel: "Bukidnon",
} as const

export type RegionPlaceKind =
  | "municipality"
  | "terminal"
  | "landmark"
  | "barangay"

export interface RegionPlace {
  name: string
  /** Sub-locality shown under the name, e.g. the barangay. */
  area: string
  kind: RegionPlaceKind
  /** `node/<id>`, `way/<id>`, or `relation/<id>` on OpenStreetMap. */
  osmId: string
  lat: number
  lng: number
}

/**
 * Quick-pick places, so someone with no GPS fix — or a rider who knows the
 * town but not the street — can book in two taps. Ordered city-first, then the
 * towns, then the transport hubs and landmarks people actually name.
 */
export const POPULAR_PLACES: RegionPlace[] = [
  // City and municipal anchors (22 LGUs)
  { name: "Malaybalay City", area: "Poblacion — provincial capital", kind: "municipality", osmId: "relation/13434541", lat: 8.1550421, lng: 125.1305726 },
  { name: "Valencia City", area: "Poblacion, Lumbo", kind: "municipality", osmId: "node/7029908178", lat: 7.9111239, lng: 125.0933669 },
  { name: "Manolo Fortich", area: "Poblacion", kind: "municipality", osmId: "relation/13452750", lat: 8.3678344, lng: 124.8663083 },
  { name: "Maramag", area: "Poblacion", kind: "municipality", osmId: "relation/13640911", lat: 7.7610686, lng: 125.005158 },
  { name: "Quezon", area: "Poblacion, Libertad", kind: "municipality", osmId: "node/6222280703", lat: 7.729608, lng: 125.1013948 },
  { name: "San Fernando", area: "Poblacion, Halapitan", kind: "municipality", osmId: "node/760200548", lat: 7.918901, lng: 125.3272642 },
  { name: "Impasug-ong", area: "Poblacion", kind: "municipality", osmId: "node/6964938765", lat: 8.3065867, lng: 125.0040803 },
  { name: "Lantapan", area: "Poblacion", kind: "municipality", osmId: "relation/13437290", lat: 7.9983082, lng: 125.0228905 },
  { name: "Sumilao", area: "Poblacion", kind: "municipality", osmId: "node/6662992522", lat: 8.2867866, lng: 124.9484512 },
  { name: "Libona", area: "Poblacion", kind: "municipality", osmId: "node/6964941502", lat: 8.3334766, lng: 124.7438335 },
  { name: "Talakag", area: "Poblacion", kind: "municipality", osmId: "node/7904864225", lat: 8.2324911, lng: 124.6019876 },
  { name: "Baungon", area: "Poblacion", kind: "municipality", osmId: "relation/13541071", lat: 8.3126139, lng: 124.6872041 },
  { name: "Pangantucan", area: "Poblacion", kind: "municipality", osmId: "node/6330390612", lat: 7.8333541, lng: 124.8297911 },
  { name: "Kalilangan", area: "Central Poblacion, Pamotolon", kind: "municipality", osmId: "node/6981565583", lat: 7.7448234, lng: 124.7491631 },
  { name: "Don Carlos", area: "Poblacion", kind: "municipality", osmId: "relation/13645657", lat: 7.6807528, lng: 124.9954728 },
  { name: "Kitaotao", area: "Poblacion, Magsaysay", kind: "municipality", osmId: "node/12624406720", lat: 7.6398774, lng: 125.0092381 },
  { name: "Kadingilan", area: "Poblacion, Salvacion", kind: "municipality", osmId: "node/6981570225", lat: 7.6009993, lng: 124.9083199 },
  { name: "Dangcagan", area: "Poblacion, Lourdes", kind: "municipality", osmId: "node/12624385227", lat: 7.6119713, lng: 125.0039515 },
  { name: "Kibawe", area: "Poblacion", kind: "municipality", osmId: "relation/16238310", lat: 7.5687481, lng: 124.9856942 },
  { name: "Damulog", area: "Poblacion", kind: "municipality", osmId: "relation/16238309", lat: 7.4848894, lng: 124.942479 },
  { name: "Cabanglasan", area: "Poblacion, Mandaing", kind: "municipality", osmId: "node/6975001999", lat: 8.0764648, lng: 125.3008854 },
  { name: "Malitbog", area: "Poblacion, Patpat", kind: "municipality", osmId: "node/6281272848", lat: 8.5354234, lng: 124.8798095 },

  // Transport hubs
  { name: "Malaybalay Integrated Bus Terminal", area: "Barangay 9, Malaybalay City", kind: "terminal", osmId: "way/177971386", lat: 8.1481091, lng: 125.1332734 },
  { name: "Valencia City Integrated Transport Terminal", area: "Hagkol, Bagontaas, Valencia City", kind: "terminal", osmId: "way/180206225", lat: 7.9309728, lng: 125.098058 },
  { name: "Valencia City Old Public Terminal", area: "Poblacion, Lumbo, Valencia City", kind: "terminal", osmId: "way/180987008", lat: 7.9033463, lng: 125.0930418 },
  { name: "Maramag Integrated Bus Terminal", area: "North Poblacion, Maramag", kind: "terminal", osmId: "way/276435956", lat: 7.7599147, lng: 125.0022779 },
  { name: "Quezon Bus Terminal", area: "Libertad, Quezon", kind: "terminal", osmId: "way/276433662", lat: 7.7134026, lng: 125.1149186 },
  { name: "San Fernando Public Terminal", area: "Halapitan, San Fernando", kind: "terminal", osmId: "way/308186274", lat: 7.9189485, lng: 125.3295899 },

  // Landmarks
  { name: "Bukidnon Provincial Capitol", area: "San Victores St, Barangay 6", kind: "landmark", osmId: "way/179272141", lat: 8.1560759, lng: 125.133532 },
  { name: "Bukidnon State University", area: "Fortich St, Barangay 3", kind: "landmark", osmId: "way/179731388", lat: 8.1563057, lng: 125.1239375 },
  { name: "Malaybalay Public Market", area: "Alvaro Pabillaran St, Barangay 9", kind: "landmark", osmId: "way/1413361322", lat: 8.1475811, lng: 125.1335728 },
  { name: "San Fernando Public Market", area: "Little Baguio, San Fernando", kind: "landmark", osmId: "way/362698013", lat: 7.9229203, lng: 125.301155 },

  // Barangays
  { name: "Casisang", area: "Malaybalay City", kind: "barangay", osmId: "relation/11999083", lat: 8.1348624, lng: 125.1269136 },
  { name: "Aglayan", area: "Malaybalay City", kind: "barangay", osmId: "node/1942195081", lat: 8.0531919, lng: 125.1353945 },
  { name: "Bagontaas", area: "Valencia City", kind: "barangay", osmId: "node/6722884251", lat: 7.9493743, lng: 125.1076054 },
]

/** Municipality names, for filters and coverage strips. */
export const MUNICIPALITIES = POPULAR_PLACES.filter(
  (place) => place.kind === "municipality"
).map((place) => place.name)

export interface LiveCity {
  name: string
  /** What is actually inside the radius, so the claim is checkable. */
  area: string
  lat: number
  lng: number
  /** How far from the town centre a pickup is accepted. */
  radiusKm: number
  /** One line on why this city is here. */
  blurb: string
}

/**
 * Where riders are actually available today.
 *
 * Deliberately short. The map and the geocoder open across the whole province,
 * but a request from a town with no rider online sits in SEARCHING until the
 * commuter cancels it — so we say two cities and mean it.
 */
export const LIVE_CITIES: LiveCity[] = [
  {
    name: "Malaybalay City",
    area: "Poblacion and the citywide barangays",
    lat: 8.1550421,
    lng: 125.1305726,
    radiusKm: 12,
    blurb:
      "The provincial capital and the busiest corridor — the terminal, the Capitol and the city market are all inside the radius.",
  },
  {
    name: "Valencia City",
    area: "Poblacion, Lumbo and the north road",
    lat: 7.9111239,
    lng: 125.0933669,
    radiusKm: 12,
    blurb:
      "The southern city on the Valencia–Malaybalay road, covering both transport terminals.",
  },
]

/** The cities riders are in today, by name. */
export const LIVE_CITY_NAMES = LIVE_CITIES.map((city) => city.name)

/** The rest of the province: real places, real pins, not yet staffed. */
export const PLANNED_MUNICIPALITIES = MUNICIPALITIES.filter(
  (name) => !LIVE_CITY_NAMES.includes(name)
)

const EARTH_RADIUS_KM = 6371

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Great-circle distance between two points, in km. */
export function regionDistanceKm(a: RegionPoint, b: RegionPoint): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) *
      Math.cos(toRadians(b.lat)) *
      Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * The live city a point falls in, or null when it falls outside all of them.
 *
 * Returns the city rather than a boolean so a caller can say *which* city is
 * out of range: "too far from Malaybalay and Valencia" is something a person
 * can act on.
 */
export function liveCityFor(
  point: RegionPoint | null | undefined
): LiveCity | null {
  if (!point) return null
  if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) return null
  for (const city of LIVE_CITIES) {
    if (regionDistanceKm(point, city) <= city.radiusKm) return city
  }
  return null
}

/** True when a pickup point is somewhere a rider will actually come to. */
export function isInServiceArea(
  point: RegionPoint | null | undefined
): boolean {
  return liveCityFor(point) !== null
}

/** The live city closest to a point, whatever that point is. */
export function nearestLiveCity(
  point: RegionPoint | null | undefined
): LiveCity | null {
  if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
    return null
  }
  let best: LiveCity | null = null
  let bestKm = Number.POSITIVE_INFINITY
  for (const city of LIVE_CITIES) {
    const km = regionDistanceKm(point, city)
    if (km < bestKm) {
      bestKm = km
      best = city
    }
  }
  return best
}

/**
 * Inside the province box, as opposed to inside a city we actually cover.
 *
 * The looser of the two checks: `isInServiceArea` answers "will a rider come
 * here", this answers "is this still the province".
 */
export function isInRegion(point: RegionPoint | null | undefined): boolean {
  if (!point) return false
  const { minLat, maxLat, minLng, maxLng } = REGION.bounds
  return (
    point.lat >= minLat &&
    point.lat <= maxLat &&
    point.lng >= minLng &&
    point.lng <= maxLng
  )
}

/**
 * Pull a point back inside the province box, for a camera/viewpoint.
 *
 * Non-finite values resolve to the provincial capital rather than propagating
 * NaN, which would render nothing at all.
 */
export function clampToRegion(point: RegionPoint): RegionPoint {
  const { minLat, maxLat, minLng, maxLng } = REGION.bounds
  const lat = Number.isFinite(point.lat) ? point.lat : REGION.center.lat
  const lng = Number.isFinite(point.lng) ? point.lng : REGION.center.lng
  return {
    lat: Math.min(maxLat, Math.max(minLat, lat)),
    lng: Math.min(maxLng, Math.max(minLng, lng)),
  }
}
