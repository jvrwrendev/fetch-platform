import type { Booking, TripStatus } from "@/shared"

/** The rider-facing API surface. */
export interface RiderApi {
  listOpenRequests(): Promise<Booking[]>
  listForRider(riderId: string): Promise<Booking[]>
  acceptBooking(id: string, riderId: string, riderName: string): Promise<void>
  rejectBooking(id: string): Promise<void>
  advance(id: string, status: TripStatus): Promise<void>
  setAvailability(riderId: string, online: boolean): Promise<void>
}
