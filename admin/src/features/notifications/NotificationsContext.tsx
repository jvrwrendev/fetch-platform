import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { AppNotification } from "@/lib/types"
import { notificationService } from "@/lib/services"

interface NotificationsContextValue {
  notifications: AppNotification[]
  loading: boolean
  unreadCount: number
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    notificationService
      .list()
      .then(setNotifications)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await notificationService.markRead(id)
  }, [])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    await notificationService.markAllRead()
  }, [])

  const remove = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await notificationService.remove(id)
  }, [])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  const value = useMemo(
    () => ({ notifications, loading, unreadCount, markRead, markAllRead, remove, refresh }),
    [notifications, loading, unreadCount, markRead, markAllRead, remove, refresh]
  )

  return (
    <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider")
  return ctx
}
