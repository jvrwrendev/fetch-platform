import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"

export function RequireAuth() {
  const { admin, booting } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="flex min-h-svh items-center justify-center text-sm text-muted-foreground">
        Loading session…
      </div>
    )
  }

  if (!admin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { admin, booting } = useAuth()
  if (booting) return null
  if (admin) return <Navigate to="/" replace />
  return <>{children}</>
}
