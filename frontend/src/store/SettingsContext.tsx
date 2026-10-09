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

import { PAYMENT_METHODS, type GeoPoint, type PaymentMethod } from "@/shared"

/** A place the passenger saved for one-tap booking ("Home", "Work", …). */
export interface SavedPlace {
  id: string
  label: string
  point: GeoPoint
}

export interface UserSettings {
  /** Trip status notifications. */
  tripUpdates: boolean
  /** Promos and announcements. */
  promos: boolean
  /** What the booking flow selects first. */
  defaultPaymentMethod: PaymentMethod
  /** Passenger shortcuts, shown above the popular places. */
  savedPlaces: SavedPlace[]
  /** Rider online/offline, so it survives a reload. */
  available: boolean
}

const DEFAULTS: UserSettings = {
  tripUpdates: true,
  promos: false,
  defaultPaymentMethod: "cash",
  savedPlaces: [],
  available: true,
}

interface SettingsContextValue {
  settings: UserSettings
  ready: boolean
  update: (patch: Partial<UserSettings>) => void
  addSavedPlace: (label: string, point: GeoPoint) => void
  removeSavedPlace: (id: string) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)
const STORAGE_KEY = "fetch_settings"

/** Coerce whatever was on disk into the current shape. */
function sanitize(raw: unknown): UserSettings {
  if (!raw || typeof raw !== "object") return DEFAULTS
  const value = raw as Partial<UserSettings>
  return {
    tripUpdates:
      typeof value.tripUpdates === "boolean"
        ? value.tripUpdates
        : DEFAULTS.tripUpdates,
    promos: typeof value.promos === "boolean" ? value.promos : DEFAULTS.promos,
    defaultPaymentMethod: PAYMENT_METHODS.includes(
      value.defaultPaymentMethod as PaymentMethod
    )
      ? (value.defaultPaymentMethod as PaymentMethod)
      : DEFAULTS.defaultPaymentMethod,
    savedPlaces: Array.isArray(value.savedPlaces)
      ? (value.savedPlaces as SavedPlace[])
      : [],
    available:
      typeof value.available === "boolean" ? value.available : DEFAULTS.available,
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULTS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (mounted && raw) setSettings(sanitize(JSON.parse(raw)))
      })
      .catch(() => undefined)
      .finally(() => mounted && setReady(true))
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings, ready])

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
  }, [])

  const addSavedPlace = useCallback((label: string, point: GeoPoint) => {
    setSettings((prev) => {
      const trimmed = label.trim() || point.name
      const existing = prev.savedPlaces.find(
        (place) => place.label.toLowerCase() === trimmed.toLowerCase()
      )
      const next: SavedPlace = {
        id: existing?.id ?? `sp${Date.now()}`,
        label: trimmed,
        point,
      }
      return {
        ...prev,
        savedPlaces: existing
          ? prev.savedPlaces.map((place) =>
              place.id === existing.id ? next : place
            )
          : [...prev.savedPlaces, next],
      }
    })
  }, [])

  const removeSavedPlace = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      savedPlaces: prev.savedPlaces.filter((place) => place.id !== id),
    }))
  }, [])

  const value = useMemo(
    () => ({
      settings,
      ready,
      update,
      addSavedPlace,
      removeSavedPlace,
    }),
    [settings, ready, update, addSavedPlace, removeSavedPlace]
  )

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
