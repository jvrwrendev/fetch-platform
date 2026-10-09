import type {
  AppNotification,
  Booking,
  GeoPoint,
  Passenger,
  Rider,
  TripStatus,
} from "../types"
import { DEFAULT_FARE_CONFIG } from "../fare"
import { LOCATIONS, PH_CITIES } from "./locations"

function mulberry32(seed: number) {
  let a = seed
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261008)

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!
const between = (min: number, max: number) => min + rand() * (max - min)
const intBetween = (min: number, max: number) => Math.floor(between(min, max + 1))

const FIRST_NAMES = [
  "Juan", "Maria", "Jose", "Ana", "Miguel", "Angelica", "Ricardo", "Teresa",
  "Paolo", "Camille", "Arjay", "Bea", "Nico", "Patricia", "Ryan", "Jasmine",
  "Carlo", "Daniela", "Mark", "Shane", "Joshua", "Rhea", "Emman", "Kyle",
  "Vince", "Aiko", "Lester", "Mika", "Geraldine", "Ronald", "Precious", "Jomar",
  "Kristine", "Alfred", "Hazel", "Dennis", "Marvin", "Catherine", "Owen", "Princess",
  "Bryan", "Lovely", "Christian", "Nicole", "Earl", "Abby", "Jerome", "Sam",
  "Michael", "Joy", "Kenneth", "Hannah", "Ralph", "Trisha", "Neil", "Gwen",
  "Victor", "Dianne", "Samuel", "Yumi",
]

const LAST_NAMES = [
  "dela Cruz", "Reyes", "Santos", "Villanueva", "Bautista", "Garcia", "Mendoza",
  "Torres", "Aquino", "Ramos", "Castillo", "Navarro", "Panganiban", "Flores",
  "Dizon", "Mercado", "Salazar", "Padilla", "Aguilar", "Domingo", "Cruz",
  "Lim", "Ong", "Tan", "Sy", "Chua", "Go", "Co", "Yu", "Limchangco",
  "Robles", "Silva", "Angeles", "Marquez", "Perez", "Roxas", "Abad", "Manalo",
  "Soriano", "Valdez", "Ferrer", "Bautista", "Cabrera", "Espinoza", "Fajardo",
  "Gonzales", "Hernandez", "Ignacio", "Jimenez", "Katigbak",
]

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com"]

const PLATE_PREFIXES = ["NCR", "ABC", "PJT", "UVL", "JRT", "SLM", "NDP", "CYA"]

const MOTOR_MODELS = [
  "Honda BeAT", "Honda Click 160", "Yamaha Mio", "Suzuki Skydrive",
  "Honda TMX 125", "KawasakiBarako II",
]

const PAYMENTS: Booking["paymentMethod"][] = ["cash", "ewallet", "cash", "ewallet"]

function slug(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .join(".")
  return `${base}${index % 7 === 0 ? index : ""}`
}

function phone(): string {
  const prefix = pick(["917", "918", "919", "920", "921", "922", "923", "926", "927", "928", "929", "930", "932", "936", "938", "939", "947", "950", "956", "977", "995", "999"])
  return `+63 ${prefix} ${intBetween(100, 999)} ${intBetween(1000, 9999)}`
}

function plate(): string {
  return `${pick(PLATE_PREFIXES)} ${intBetween(1000, 9999)}`
}

function license(): string {
  return `${intBetween(10, 99)}-${intBetween(1000, 9999)}-${intBetween(1000, 9999)}`
}

function daysAgo(days: number, hourMin = 8, hourMax = 21): string {
  const d = new Date("2026-10-08T12:00:00+08:00")
  d.setDate(d.getDate() - days)
  d.setHours(intBetween(hourMin, hourMax), intBetween(0, 59), 0, 0)
  return d.toISOString()
}

function jitter(point: GeoPoint): GeoPoint {
  return {
    ...point,
    lat: point.lat + between(-0.012, 0.012),
    lng: point.lng + between(-0.012, 0.012),
  }
}

const VEHICLE_RATES = DEFAULT_FARE_CONFIG

export const PASSENGERS: Passenger[] = Array.from({ length: 60 }, (_, i) => {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
  const totalTrips = intBetween(0, 140)
  const rating = Math.round(between(3.6, 5) * 10) / 10
  return {
    id: `P${String(1001 + i)}`,
    name,
    email: `${slug(name, i)}@${pick(EMAIL_DOMAINS)}`,
    phone: phone(),
    status: rand() > 0.18 ? "active" : "inactive",
    rating: Math.min(rating, 5),
    totalTrips,
    totalSpend: totalTrips * intBetween(90, 240),
    joinedAt: daysAgo(intBetween(20, 700)),
    lastActiveAt: daysAgo(intBetween(0, 45)),
    city: pick(PH_CITIES),
  }
})

export const RIDERS: Rider[] = Array.from({ length: 40 }, (_, i) => {
  const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`
  const roll = rand()
  const approval = roll > 0.9 ? "pending" : roll > 0.85 ? "rejected" : "approved"
  const statusRoll = rand()
  const status =
    approval !== "approved"
      ? "inactive"
      : statusRoll > 0.94
        ? "suspended"
        : statusRoll > 0.14
          ? "active"
          : "inactive"
  const totalTrips = intBetween(15, 950)
  const cancels = Math.round(totalTrips * (rand() * 0.08))
  const availRoll = rand()
  return {
    id: `R${String(2001 + i)}`,
    name,
    email: `${slug(name, i + 90)}@${pick(EMAIL_DOMAINS)}`,
    phone: phone(),
    approval: approval as Rider["approval"],
    status: status as Rider["status"],
    availability:
      status === "active" && approval === "approved"
        ? availRoll > 0.62
          ? "online"
          : availRoll > 0.34
            ? "on_trip"
            : "offline"
        : "offline",
    rating: Math.min(Math.round(between(3.9, 5) * 10) / 10, 5),
    totalTrips,
    completedTrips: totalTrips - cancels,
    cancelRate: Math.round((cancels / Math.max(totalTrips, 1)) * 1000) / 10,
    vehicle: {
      model: pick(MOTOR_MODELS),
      plateNumber: plate(),
    },
    licenseNumber: license(),
    joinedAt: daysAgo(intBetween(15, 800)),
    lastActiveAt: daysAgo(intBetween(0, 20)),
    city: pick(PH_CITIES),
    location: jitter(pick(LOCATIONS)),
  }
})

const APPROVED_RIDERS = RIDERS.filter((r) => r.approval === "approved")

const BOOKING_STATUSES: { status: TripStatus; weight: number }[] = [
  { status: "completed", weight: 0.62 },
  { status: "cancelled", weight: 0.12 },
  { status: "in_progress", weight: 0.08 },
  { status: "arriving", weight: 0.05 },
  { status: "accepted", weight: 0.05 },
  { status: "searching", weight: 0.08 },
]

function weightedStatus(): TripStatus {
  const roll = rand()
  let acc = 0
  for (const item of BOOKING_STATUSES) {
    acc += item.weight
    if (roll <= acc) return item.status
  }
  return "completed"
}

function activePassengers() {
  const active = PASSENGERS.filter((p) => p.status === "active")
  return active.length > 0 ? active : PASSENGERS
}

export const BOOKINGS: Booking[] = Array.from({ length: 150 }, (_, i) => {
  const passenger = pick(activePassengers())
  const status = weightedStatus()
  const needsRider = status !== "searching"
  const rider = needsRider && APPROVED_RIDERS.length > 0 ? pick(APPROVED_RIDERS) : undefined
  const pickup = pick(LOCATIONS)
  let dropoff = pick(LOCATIONS)
  while (dropoff.name === pickup.name) dropoff = pick(LOCATIONS)

  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(dropoff.lat - pickup.lat)
  const dLng = toRad(dropoff.lng - pickup.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(pickup.lat)) * Math.cos(toRad(dropoff.lat)) * Math.sin(dLng / 2) ** 2
  const distanceKm = Math.max(Math.round(2 * R * Math.asin(Math.sqrt(h)) * 10) / 10, 0.8)

  const rate = VEHICLE_RATES
  const baseCost = rate.base
  const distanceCost = Math.round(distanceKm * rate.perKm)
  const total = status === "cancelled" ? 0 : baseCost + distanceCost

  const daysBack = i < 8 ? intBetween(0, 1) : intBetween(0, 89)
  const createdAt = daysAgo(daysBack, 6, 22)
  const completedAt =
    status === "completed" || status === "cancelled"
      ? new Date(new Date(createdAt).getTime() + intBetween(12, 55) * 60_000).toISOString()
      : undefined

  return {
    id: `b${1001 + i}`,
    reference: `FT-${String(84000 + i)}`,
    passengerId: passenger.id,
    passengerName: passenger.name,
    riderId: rider?.id,
    riderName: rider?.name,
    pickup,
    dropoff,
    distanceKm,
    fare: { base: baseCost, distance: distanceCost, total },
    status,
    paymentMethod: pick(PAYMENTS),
    createdAt,
    completedAt,
  }
}).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "booking",
    severity: "success",
    title: "Booking completed",
    message: `${BOOKINGS[0].reference} was completed by ${BOOKINGS[0].riderName ?? "a rider"} — ${BOOKINGS[0].fare.total > 0 ? `₱${BOOKINGS[0].fare.total}` : "no fare"}.`,
    read: false,
    createdAt: daysAgo(0, 9, 11),
    reference: BOOKINGS[0].reference,
  },
  {
    id: "n2",
    kind: "system",
    severity: "warning",
    title: "Rider awaiting approval",
    message: `${RIDERS.find((r) => r.approval === "pending")?.name ?? "A new rider"} submitted documents for verification.`,
    read: false,
    createdAt: daysAgo(0, 8, 10),
  },
  {
    id: "n3",
    kind: "booking",
    severity: "info",
    title: "Trip in progress",
    message: `${BOOKINGS.find((b) => b.status === "in_progress")?.reference ?? "A booking"} is currently en route to its destination.`,
    read: false,
    createdAt: daysAgo(0, 7, 9),
  },
  {
    id: "n4",
    kind: "system",
    severity: "danger",
    title: "Rider suspended",
    message: `${RIDERS.find((r) => r.status === "suspended")?.name ?? "A rider"} was suspended after repeated cancellations.`,
    read: true,
    createdAt: daysAgo(1, 14, 17),
  },
  {
    id: "n5",
    kind: "booking",
    severity: "warning",
    title: "Booking cancelled",
    message: `${BOOKINGS.find((b) => b.status === "cancelled")?.reference ?? "A booking"} was cancelled by the passenger.`,
    read: true,
    createdAt: daysAgo(1, 10, 13),
  },
  {
    id: "n6",
    kind: "system",
    severity: "success",
    title: "Weekly payout settled",
    message: "Rider payouts for Sept 29 – Oct 5 have been processed via bank transfer.",
    read: true,
    createdAt: daysAgo(2, 9, 11),
  },
  {
    id: "n7",
    kind: "system",
    severity: "info",
    title: "New passenger registrations",
    message: `${intBetween(8, 30)} new passengers registered in the last 24 hours.`,
    read: true,
    createdAt: daysAgo(3, 8, 10),
  },
  {
    id: "n8",
    kind: "booking",
    severity: "success",
    title: "Peak-hour surge applied",
    message: "Surge pricing was applied to 42 bookings during the evening rush in Makati.",
    read: true,
    createdAt: daysAgo(4, 17, 20),
  },
  {
    id: "n9",
    kind: "system",
    severity: "warning",
    title: "Document expiring",
    message: `${intBetween(2, 5)} riders have LTFRB documents expiring within 30 days.`,
    read: true,
    createdAt: daysAgo(5, 9, 12),
  },
  {
    id: "n10",
    kind: "booking",
    severity: "info",
    title: "Airport queue backup",
    message: "NAIA Terminal 3 pickup queue exceeded 15 riders — consider prompting availability elsewhere.",
    read: true,
    createdAt: daysAgo(6, 13, 16),
  },
]

export const SAMPLE_PICKUP: GeoPoint = LOCATIONS[0]!
export const SAMPLE_DROPOFF: GeoPoint = LOCATIONS[6]!
