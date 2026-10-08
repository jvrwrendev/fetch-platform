import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Car, History, Home, MapPin, User, ListChecks } from "lucide-react"
import { Toaster } from "@/components/ui/sonner"
import AppLayout, { type NavItem } from "@/components/layout/AppLayout"
import { RoleRoute } from "@/components/layout/guards"
import { AuthProvider, useAuth } from "@/features/auth/AuthContext"
import { BookingsProvider } from "@/features/bookings/BookingsContext"
import LoginPage from "@/features/auth/LoginPage"
import PassengerHome from "@/features/passenger/pages/Home"
import BookRide from "@/features/passenger/pages/BookRide"
import TripStatusPage from "@/features/passenger/pages/TripStatus"
import PassengerHistory from "@/features/passenger/pages/History"
import PassengerProfile from "@/features/passenger/pages/Profile"
import RiderDashboard from "@/features/rider/pages/Dashboard"
import Requests from "@/features/rider/pages/Requests"
import RiderActiveIndex from "@/features/rider/pages/ActiveIndex"
import RiderTrip from "@/features/rider/pages/ActiveTrip"
import RiderHistory from "@/features/rider/pages/History"
import RiderProfile from "@/features/rider/pages/Profile"

const passengerNav: NavItem[] = [
  { to: "/passenger", label: "Home", icon: Home },
  { to: "/passenger/book", label: "Book", icon: MapPin },
  { to: "/passenger/history", label: "Trips", icon: History },
  { to: "/passenger/profile", label: "Profile", icon: User },
]

const riderNav: NavItem[] = [
  { to: "/rider", label: "Dashboard", icon: Home },
  { to: "/rider/requests", label: "Requests", icon: ListChecks },
  { to: "/rider/active", label: "Trip", icon: Car },
  { to: "/rider/history", label: "Trips", icon: History },
  { to: "/rider/profile", label: "Profile", icon: User },
]

function Root() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === "rider" ? "/rider" : "/passenger"} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BookingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Root />} />
            <Route
              path="/passenger"
              element={
                <RoleRoute role="passenger">
                  <AppLayout items={passengerNav} />
                </RoleRoute>
              }
            >
              <Route index element={<PassengerHome />} />
              <Route path="book" element={<BookRide />} />
              <Route path="trip/:id" element={<TripStatusPage />} />
              <Route path="history" element={<PassengerHistory />} />
              <Route path="profile" element={<PassengerProfile />} />
            </Route>
            <Route
              path="/rider"
              element={
                <RoleRoute role="rider">
                  <AppLayout items={riderNav} />
                </RoleRoute>
              }
            >
              <Route index element={<RiderDashboard />} />
              <Route path="requests" element={<Requests />} />
              <Route path="active" element={<RiderActiveIndex />} />
              <Route path="trip/:id" element={<RiderTrip />} />
              <Route path="history" element={<RiderHistory />} />
              <Route path="profile" element={<RiderProfile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </BookingsProvider>
    </AuthProvider>
  )
}
