import { useMutation, useQuery } from "convex/react"
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"

import { api } from "@convex/_generated/api"
import type { AppNotification } from "@/shared"
import { useAuth } from "@/store/AuthContext"

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  markAllRead: () => void
  markRead: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
)

function toNotification(doc: Record<string, unknown>): AppNotification {
  return {
    id: String(doc.id),
    kind: doc.kind as AppNotification["kind"],
    severity: doc.severity as AppNotification["severity"],
    title: String(doc.title),
    message: String(doc.message),
    read: Boolean(doc.read),
    createdAt: String(doc.createdAt),
  }
}

/** The header bell's list, per account, straight from Convex. */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const rows = useQuery(
    api.notifications.listMine,
    user ? { userId: user.id } : "skip"
  )
  const markAllReadMutation = useMutation(api.notifications.markAllRead)
  const markReadMutation = useMutation(api.notifications.markRead)

  const value = useMemo(() => {
    const notifications = (rows ?? []).map((row) =>
      toNotification(row as unknown as Record<string, unknown>)
    )
    return {
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      markAllRead: () => {
        if (user) void markAllReadMutation({ userId: user.id })
      },
      markRead: (id: string) => {
        void markReadMutation({ id })
      },
    }
  }, [rows, user, markAllReadMutation, markReadMutation])

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    )
  }
  return context
}
