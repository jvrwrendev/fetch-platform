import type { Passenger, Rider } from "../types"
import { LOCATIONS, PH_CITIES } from "./locations"

/**
 * The demo population: the 60 passengers and 40 riders the admin console
 * browses. Seeded into Convex by `convex/directory.ts`, so this stays the one
 * definition of who the demo world contains.
 */

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
const intBetween = (min: number, max: number) =>
  Math.floor(between(min, max + 1))

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

/** The platform runs motorcycle taxis, so riders all ride one of these. */
const MOTOR_MODELS = [
  "Honda BeAT", "Honda Click 160", "Yamaha Mio", "Suzuki Skydrive",
  "Honda TMX 125", "Kawasaki Barako II",
]

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

function jitter(point: { lat: number; lng: number }) {
  return {
    lat: point.lat + between(-0.012, 0.012),
    lng: point.lng + between(-0.012, 0.012),
  }
}

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
    location: { name: "Rider", address: "Nearby", ...jitter(pick(LOCATIONS)) },
  }
})
