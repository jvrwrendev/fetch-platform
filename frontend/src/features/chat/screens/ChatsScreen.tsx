import { useRouter } from "expo-router"
import { MessageCircle } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { useChats } from "@/store/ChatsContext"
import { serviceLabel } from "@/shared"
import { useThemeColors } from "@/theme"
import { relativeTime } from "@/utils/format"

/** Every conversation this account is in, ride-scoped like the reference. */
export default function ChatsScreen() {
  const { user } = useAuth()
  const { bookings } = useBookings()
  const { messages, lastRead } = useChats()
  const router = useRouter()
  const colors = useThemeColors()

  const isRider = user?.role === "rider"
  const base = isRider ? "/rider" : "/passenger"

  const threads = bookings
    .filter(
      (booking) =>
        booking.passengerId === user?.id || booking.riderId === user?.id
    )
    .map((booking) => {
      const thread = messages
        .filter((message) => message.bookingId === booking.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const last = thread[thread.length - 1]
      const counterpart = isRider ? booking.passengerName : booking.riderName
      const unread =
        Boolean(user) &&
        thread.some(
          (message) =>
            message.senderId !== user!.id &&
            +new Date(message.createdAt) > lastRead(user!.id, booking.id)
        )
      return { booking, last, counterpart, unread, started: thread.length > 0 }
    })
    .filter((thread) => thread.counterpart || thread.started)
    .sort((a, b) => {
      const at = +new Date(a.last?.createdAt ?? a.booking.createdAt)
      const bt = +new Date(b.last?.createdAt ?? b.booking.createdAt)
      return bt - at
    })

  return (
    <Screen header>
      <PageHeader
        title="Chats"
        description="Conversations with the other side of each trip."
      />

      {threads.length === 0 ? (
        <View className="items-center gap-2 rounded-xl border border-border bg-card p-8">
          <MessageCircle size={22} color={colors.mutedForeground} />
          <Text className="text-center text-sm text-muted-foreground">
            No conversations yet. They start once a trip has a rider.
          </Text>
        </View>
      ) : (
        threads.map(({ booking, last, counterpart, unread }) => {
          const service = serviceLabel(booking.bookingType, "commuter")
          return (
            <Pressable
              key={booking.id}
              onPress={() => router.push(`${base}/chat/${booking.id}`)}
            >
              <Card>
                <CardContent className="flex-row items-start justify-between gap-3 p-4 pt-4">
                  <View className="min-w-0 flex-1 gap-1">
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-sm font-semibold"
                        numberOfLines={1}
                      >
                        {counterpart ?? "Awaiting a rider"}
                      </Text>
                      {unread ? (
                        <View className="size-2 rounded-full bg-primary" />
                      ) : null}
                    </View>
                    <Text
                      className="text-xs text-muted-foreground"
                      numberOfLines={1}
                    >
                      {last
                        ? `${last.senderId === user?.id ? "You: " : ""}${last.body}`
                        : `${booking.reference}${service ? ` · ${service}` : ""}`}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-muted-foreground">
                    {relativeTime(last?.createdAt ?? booking.createdAt)}
                  </Text>
                </CardContent>
              </Card>
            </Pressable>
          )
        })
      )}
    </Screen>
  )
}
