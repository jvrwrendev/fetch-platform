import { useMutation, useQuery } from "convex/react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react"

import { api } from "@convex/_generated/api"
import { useAuth } from "@/store/AuthContext"

/** One message on a booking's thread. */
export interface ChatMessage {
  id: string
  bookingId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

interface ChatsContextValue {
  messages: ChatMessage[]
  send: (
    bookingId: string,
    senderId: string,
    senderName: string,
    body: string
  ) => void
  /** Highest read timestamp for a (user, booking) pair, as a ms number. */
  lastRead: (userId: string, bookingId: string) => number
  markRead: (userId: string, bookingId: string) => void
  unreadFor: (userId: string, bookingIds: string[]) => number
}

const ChatsContext = createContext<ChatsContextValue | null>(null)

function toMessage(doc: Record<string, unknown>): ChatMessage {
  return {
    id: String(doc.id),
    bookingId: String(doc.bookingId),
    senderId: String(doc.senderId),
    senderName: String(doc.senderName),
    body: String(doc.body),
    createdAt: String(doc.createdAt),
  }
}

/**
 * Ride-scoped chat, backed by Convex. Every open client sees the other side's
 * message as it lands — no polling and no local mirror to drift.
 */
export function ChatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const messageRows = useQuery(
    api.messages.listForUser,
    user ? { userId: user.id } : "skip"
  )
  const cursorRows = useQuery(
    api.messages.readCursors,
    user ? { userId: user.id } : "skip"
  )
  const sendMessage = useMutation(api.messages.send)
  const markReadMutation = useMutation(api.messages.markRead)

  const messages = useMemo(
    () =>
      (messageRows ?? []).map((row) =>
        toMessage(row as unknown as Record<string, unknown>)
      ),
    [messageRows]
  )

  const cursors = useMemo(() => {
    const map: Record<string, number> = {}
    for (const row of cursorRows ?? []) {
      map[`${row.userId}:${row.bookingId}`] = +new Date(row.readAt)
    }
    return map
  }, [cursorRows])

  const send = useCallback<ChatsContextValue["send"]>(
    (bookingId, senderId, senderName, body) => {
      const trimmed = body.trim()
      if (!trimmed) return
      void sendMessage({ bookingId, senderId, senderName, body: trimmed })
    },
    [sendMessage]
  )

  const lastRead = useCallback(
    (userId: string, bookingId: string) => cursors[`${userId}:${bookingId}`] ?? 0,
    [cursors]
  )

  const markRead = useCallback(
    (userId: string, bookingId: string) => {
      void markReadMutation({ userId, bookingId })
    },
    [markReadMutation]
  )

  const unreadFor = useCallback(
    (userId: string, bookingIds: string[]) => {
      const ids = new Set(bookingIds)
      return messages.filter(
        (message) =>
          ids.has(message.bookingId) &&
          message.senderId !== userId &&
          +new Date(message.createdAt) > (cursors[`${userId}:${message.bookingId}`] ?? 0)
      ).length
    },
    [messages, cursors]
  )

  const value = useMemo(
    () => ({ messages, send, lastRead, markRead, unreadFor }),
    [messages, send, lastRead, markRead, unreadFor]
  )

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
}

export function useChats() {
  const context = useContext(ChatsContext)
  if (!context) {
    throw new Error("useChats must be used within a ChatsProvider")
  }
  return context
}
