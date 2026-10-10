import AsyncStorage from "@react-native-async-storage/async-storage"
import { useMutation, useQuery } from "convex/react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { api } from "@convex/_generated/api"
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

const FIELDS = [
  "id",
  "name",
  "email",
  "phone",
  "role",
  "rating",
  "totalTrips",
  "vehicleModel",
  "plateNumber",
  "online",
] as const

/** Trim a Convex user row down to the domain `User`. */
function toUser(doc: Record<string, unknown>): User {
  const user = {} as Record<string, unknown>
  for (const field of FIELDS) {
    if (doc[field] !== undefined) user[field] = doc[field]
  }
  return user as unknown as User
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  // The demo accounts live in Convex; the shared mock is the pre-load fallback.
  const docs = useQuery(api.users.list)
  const patchUser = useMutation(api.users.update)

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

  const login = useCallback(
    (role: Role, userId?: string) => {
      const rows = docs?.map(toUser) ?? []
      const found =
        rows.find((entry) => entry.id === userId) ??
        rows.find((entry) => entry.role === role) ??
        USERS.find((entry) => entry.id === userId) ??
        USERS.find((entry) => entry.role === role)
      if (!found) return
      setUser(found)
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(found))
    },
    [docs]
  )

  const logout = useCallback(() => {
    setUser(null)
    void AsyncStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateProfile = useCallback(
    (patch: Partial<User>) => {
      setUser((prev) => {
        if (!prev) return prev
        const next = { ...prev, ...patch, id: prev.id, role: prev.role }
        void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
      if (!user) return
      void patchUser({
        id: user.id,
        name: patch.name,
        phone: patch.phone,
        vehicleModel: patch.vehicleModel,
        plateNumber: patch.plateNumber,
        online: patch.online,
      })
    },
    [patchUser, user]
  )

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
