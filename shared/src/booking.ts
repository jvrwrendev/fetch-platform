import type { BookingType } from "./types"

/**
 * The three things a passenger can book, in the order they are offered.
 *
 * `padala` is the internal value; passengers read "Pasugo" and riders read
 * "Padala" (see {@link serviceLabel}). Keeping one value avoids every screen
 * inventing its own name for the same request.
 */
export const BOOKING_TYPES: BookingType[] = ["ride", "pabili", "padala"]

/** The service a plain "Book a ride" link opens. */
export const DEFAULT_BOOKING_TYPE: BookingType = "ride"

/**
 * Read a service out of a route parameter.
 *
 * Falls back to a plain ride for anything unrecognised, because the value comes
 * straight off the URL and an unchecked cast would render an errand form to
 * someone who asked for neither.
 */
export function resolveBookingType(raw: string | null | undefined): BookingType {
  return BOOKING_TYPES.includes(raw as BookingType)
    ? (raw as BookingType)
    : DEFAULT_BOOKING_TYPE
}

/** Who is being shown the label. */
export type ServiceAudience = "commuter" | "rider"

/**
 * The service name as one audience should read it.
 *
 * A plain ride has no service name — it is left off rather than printing "Ride"
 * next to a status the row already shows.
 */
export function serviceLabel(
  bookingType: string | null | undefined,
  audience: ServiceAudience
): string {
  if (bookingType === "pabili") return "Pabili"
  if (bookingType === "padala") {
    return audience === "rider" ? "Padala" : "Pasugo"
  }
  return ""
}

/** Heading for the booking screen, naming the service being asked for. */
export const BOOKING_TYPE_TITLE: Record<BookingType, string> = {
  ride: "Book a ride",
  pabili: "Order pabili",
  padala: "Send a pasugo",
}

/** One-line description shown under each service choice. */
export const BOOKING_TYPE_DESCRIPTION: Record<BookingType, string> = {
  ride: "Take me from A to B.",
  pabili: "Buy something for me and bring it over.",
  padala: "Pick something up and deliver it.",
}

/** The confirm button's wording per service. */
export const BOOKING_TYPE_CTA: Record<BookingType, string> = {
  ride: "Confirm booking",
  pabili: "Request pabili",
  padala: "Send a pasugo",
}
