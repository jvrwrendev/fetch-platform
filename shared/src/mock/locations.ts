import { MUNICIPALITIES, POPULAR_PLACES } from "../region"
import type { GeoPoint } from "../types"

/**
 * The points the mock apps book against.
 *
 * A curated subset of the Bukidnon place set: the two live cities, their
 * terminals and landmarks, and the neighbouring towns a passenger might name.
 * The full provincial list lives in `region.ts` (`POPULAR_PLACES`).
 */
const QUICK_PICK_NAMES = [
  "Malaybalay City",
  "Valencia City",
  "Bukidnon Provincial Capitol",
  "Bukidnon State University",
  "Malaybalay Public Market",
  "Malaybalay Integrated Bus Terminal",
  "Valencia City Integrated Transport Terminal",
  "Casisang",
  "Manolo Fortich",
  "Maramag",
  "San Fernando",
]

export const LOCATIONS: GeoPoint[] = QUICK_PICK_NAMES.map((name) => {
  const place = POPULAR_PLACES.find((candidate) => candidate.name === name)!
  return {
    name: place.name,
    address: place.area,
    lat: place.lat,
    lng: place.lng,
  }
})

/** Bukidnon municipalities, for the admin city filter and generated profiles. */
export const PH_CITIES = [...MUNICIPALITIES]
