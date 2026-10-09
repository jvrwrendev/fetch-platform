import { adminsRoutes } from "../modules/admins"
import { bookingsRoutes } from "../modules/bookings"
import { passengersRoutes } from "../modules/passengers"
import { reportsRoutes } from "../modules/reports"
import { ridersRoutes } from "../modules/riders"
import { servicesRoutes } from "../modules/services"
import { usersRoutes } from "../modules/users"

/** The API route table. `server.ts` would mount these onto the HTTP app. */
export const routes = [
  passengersRoutes,
  ridersRoutes,
  adminsRoutes,
  usersRoutes,
  servicesRoutes,
  bookingsRoutes,
  reportsRoutes,
] as const

export type Routes = typeof routes
