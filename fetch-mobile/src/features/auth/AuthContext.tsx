import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { USERS } from "@/data/mock"
import type { Role, User } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  login: (role: Role, userId?: string) => void
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = "fetch_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  })

  const login = useCallback((role: Role, userId?: string) => {
    const found =
      USERS.find((u) => u.id === userId) ?? USERS.find((u) => u.role === role)
    if (!found) return
    setUser(found)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch, id: prev.id, role: prev.role }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ user, login, logout, updateProfile }),
    [user, login, logout, updateProfile]
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
