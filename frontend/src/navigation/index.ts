/**
 * Typed route map. Screens push through these instead of hard-coded strings so
 * a rename only has to happen in one place.
 */
export const routes = {
  landing: "/",
  login: "/login",
  passenger: {
    dashboard: "/passenger/dashboard",
    services: "/passenger/services",
    booking: "/passenger/booking",
    tracking: "/passenger/tracking",
    history: "/passenger/history",
    profile: "/passenger/profile",
  },
  rider: {
    dashboard: "/rider/dashboard",
    services: "/rider/services",
    activeTrip: "/rider/active-trip",
    history: "/rider/history",
    profile: "/rider/profile",
    trip: (id: string) => `/rider/trip/${id}`,
  },
} as const
