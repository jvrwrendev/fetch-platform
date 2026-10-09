import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { AdminProfile } from "@/lib/types"
import { authService } from "@/lib/services"

const STORAGE_KEY = "fetch.admin.session"

interface AuthContextValue {
  admin: AdminProfile | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (patch: Partial<AdminProfile>) => void
  booting: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readSession(): AdminProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminProfile
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    setAdmin(readSession())
    setBooting(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const profile = await authService.login(email, password)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setAdmin(profile)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAdmin(null)
  }, [])

  const updateProfile = useCallback((patch: Partial<AdminProfile>) => {
    setAdmin((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      if (patch.name) {
        next.initials = patch.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p[0]!.toUpperCase())
          .join("")
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ admin, login, logout, updateProfile, booting }),
    [admin, login, logout, updateProfile, booting]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
