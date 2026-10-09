import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { RequireAuth, RedirectIfAuthed } from "@/components/layout/guards"
import AdminLayout from "@/components/layout/AdminLayout"
import { AuthProvider } from "@/features/auth/AuthContext"
import { NotificationsProvider } from "@/features/notifications/NotificationsContext"
import { PassengersProvider } from "@/features/passengers/PassengersContext"
import { RidersProvider } from "@/features/riders/RidersContext"
import { BookingsProvider } from "@/features/bookings/BookingsContext"
import LoginPage from "@/features/auth/LoginPage"
import DashboardPage from "@/features/dashboard/DashboardPage"
import PassengersPage from "@/features/passengers/PassengersPage"
import RidersPage from "@/features/riders/RidersPage"
import BookingsPage from "@/features/bookings/BookingsPage"
import LiveMapPage from "@/features/map/LiveMapPage"
import ReportsPage from "@/features/reports/ReportsPage"
import NotificationsPage from "@/features/notifications/NotificationsPage"
import FareRatesPage from "@/features/fare/FareRatesPage"
import ProfilePage from "@/features/settings/ProfilePage"
import SettingsPage from "@/features/settings/SettingsPage"

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <PassengersProvider>
          <RidersProvider>
            <BookingsProvider>
              <TooltipProvider>
                <BrowserRouter>
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        <RedirectIfAuthed>
                          <LoginPage />
                        </RedirectIfAuthed>
                      }
                    />
                    <Route element={<RequireAuth />}>
                      <Route element={<AdminLayout />}>
                        <Route index element={<DashboardPage />} />
                        <Route path="passengers" element={<PassengersPage />} />
                        <Route path="riders" element={<RidersPage />} />
                        <Route path="bookings" element={<BookingsPage />} />
                        <Route path="live-map" element={<LiveMapPage />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="notifications" element={<NotificationsPage />} />
                        <Route path="fare-rates" element={<FareRatesPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="settings" element={<SettingsPage />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                  <Toaster richColors position="top-right" />
                </BrowserRouter>
              </TooltipProvider>
            </BookingsProvider>
          </RidersProvider>
        </PassengersProvider>
      </NotificationsProvider>
    </AuthProvider>
  )
}
