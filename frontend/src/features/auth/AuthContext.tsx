import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { USERS, type Role, type User } from "@/shared"

interface AuthContextValue {
  user: User | null
  ready: boolean
  login: (role: Role, userId?: string) => void
  logout: () => void
  updateProfile: (patch: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const STORAGE_KEY = "fetch_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (mounted && raw) setUser(JSON.parse(raw) as User)
      })
      .catch(() => undefined)
      .finally(() => mounted && setReady(true))
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback((role: Role, userId?: string) => {
    const found =
      USERS.find((entry) => entry.id === userId) ??
      USERS.find((entry) => entry.role === role)
    if (!found) return
    setUser(found)
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(found))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    void AsyncStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ user, ready, login, logout, updateProfile }),
    [user, ready, login, logout, updateProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
