import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "@/features/auth/AuthContext"
import type { Role } from "@/lib/types"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RoleRoute({
  role,
  children,
}: {
  role: Role
  children: ReactNode
}) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role)
    return <Navigate to={user.role === "rider" ? "/rider" : "/passenger"} replace />
  return <>{children}</>
}
