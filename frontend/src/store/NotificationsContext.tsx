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

import { NOTIFICATIONS, type AppNotification } from "@/shared"

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)
const STORAGE_KEY = "fetch_notifications"

/** Read state for the bell, seeded from the shared mock world and persisted. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<AppNotification[]>(NOTIFICATIONS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let mounted = true
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (mounted && raw) setNotifications(JSON.parse(raw) as AppNotification[])
      })
      .catch(() => undefined)
      .finally(() => mounted && setHydrated(true))
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications, hydrated])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    )
  }, [])

  const value = useMemo(() => {
    const unreadCount = notifications.filter((item) => !item.read).length
    return { notifications, unreadCount, markAllRead, markRead }
  }, [notifications, markAllRead, markRead])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider")
  }
  return context
}
