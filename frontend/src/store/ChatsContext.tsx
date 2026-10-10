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

/** One message on a booking's thread. */
export interface ChatMessage {
  id: string
  bookingId: string
  senderId: string
  senderName: string
  body: string
  createdAt: string
}

/** Seed conversations, so the list is not empty on a fresh install. */
const SEED: ChatMessage[] = [
  {
    id: "m1",
    bookingId: "b1",
    senderId: "r1",
    senderName: "Maria Santos",
    body: "I'm on my way, ma'am. See you at the lobby.",
    createdAt: "2026-10-06T09:31:00Z",
  },
  {
    id: "m2",
    bookingId: "b1",
    senderId: "p1",
    senderName: "Alex Reyes",
    body: "Okay, I'm waiting by the entrance.",
    createdAt: "2026-10-06T09:33:00Z",
  },
  {
    id: "m3",
    bookingId: "b4",
    senderId: "p1",
    senderName: "Alex Reyes",
    body: "Please grab the spicy variant if they have it.",
    createdAt: "2026-09-29T10:16:00Z",
  },
  {
    id: "m4",
    bookingId: "b4",
    senderId: "r1",
    senderName: "Maria Santos",
    body: "Got it — buying now, will send a photo.",
    createdAt: "2026-09-29T10:18:00Z",
  },
]

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
const STORAGE_KEY = "fetch_chats"

export function ChatsProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED)
  const [readAt, setReadAt] = useState<Record<string, string>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let mounted = true
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!mounted || !raw) return
        const parsed = JSON.parse(raw) as {
          messages?: ChatMessage[]
          readAt?: Record<string, string>
        }
        if (parsed.messages) setMessages(parsed.messages)
        if (parsed.readAt) setReadAt(parsed.readAt)
      })
      .catch(() => undefined)
      .finally(() => mounted && setHydrated(true))
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    void AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, readAt })
    )
  }, [messages, readAt, hydrated])

  const send = useCallback<ChatsContextValue["send"]>(
    (bookingId, senderId, senderName, body) => {
      const trimmed = body.trim()
      if (!trimmed) return
      setMessages((prev) => [
        ...prev,
        {
          id: `m${Date.now()}`,
          bookingId,
          senderId,
          senderName,
          body: trimmed,
          createdAt: new Date().toISOString(),
        },
      ])
    },
    []
  )

  const lastRead = useCallback(
    (userId: string, bookingId: string) => {
      const iso = readAt[`${userId}:${bookingId}`]
      return iso ? +new Date(iso) : 0
    },
    [readAt]
  )

  const markRead = useCallback((userId: string, bookingId: string) => {
    setReadAt((prev) => ({
      ...prev,
      [`${userId}:${bookingId}`]: new Date().toISOString(),
    }))
  }, [])

  const unreadFor = useCallback(
    (userId: string, bookingIds: string[]) => {
      const ids = new Set(bookingIds)
      return messages.filter(
        (message) =>
          ids.has(message.bookingId) &&
          message.senderId !== userId &&
          +new Date(message.createdAt) > lastRead(userId, message.bookingId)
      ).length
    },
    [messages, lastRead]
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
