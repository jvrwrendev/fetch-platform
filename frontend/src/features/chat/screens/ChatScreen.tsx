import { useLocalSearchParams, useRouter } from "expo-router"
import { ArrowLeft, SendHorizonal } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Pressable, TextInput, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { useChats } from "@/store/ChatsContext"
import { useThemeColors } from "@/theme"
import { cn } from "@/utils/cn"

/** One booking's messages, with a composer. */
export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { bookings } = useBookings()
  const { messages, send, markRead } = useChats()
  const [draft, setDraft] = useState("")
  const colors = useThemeColors()

  const booking = bookings.find((entry) => entry.id === id)
  const thread = messages
    .filter((message) => message.bookingId === id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  useEffect(() => {
    if (user && id) markRead(user.id, id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id, thread.length])

  if (!booking || !user) {
    return (
      <Screen>
        <PageHeader title="Chat not found" />
        <Button variant="outline" onPress={() => router.back()}>
          Back
        </Button>
      </Screen>
    )
  }

  const counterpart =
    user.role === "rider" ? booking.passengerName : booking.riderName

  const submit = () => {
    send(booking.id, user.id, user.name, draft)
    setDraft("")
  }

  return (
    <Screen scroll={false}>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => router.back()}
          className="size-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft size={16} color={colors.foreground} />
        </Pressable>
        <PageHeader
          title={counterpart ?? "Trip chat"}
          description={booking.reference}
        />
      </View>

      <View className="flex-1 gap-2 py-2">
        {thread.length === 0 ? (
          <Text className="text-center text-sm text-muted-foreground">
            Say hello to coordinate the trip.
          </Text>
        ) : (
          thread.map((message) => {
            const mine = message.senderId === user.id
            return (
              <View
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2",
                  mine
                    ? "self-end rounded-br-sm bg-primary"
                    : "self-start rounded-bl-sm border border-border bg-card"
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    mine ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {message.body}
                </Text>
              </View>
            )
          })
        )}
      </View>

      <View className="flex-row items-end gap-2">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Message…"
          placeholderTextColor={colors.mutedForeground}
          multiline
          className="max-h-28 flex-1 rounded-2xl border border-input bg-background px-3 py-2.5 text-base text-foreground"
        />
        <Pressable
          onPress={submit}
          disabled={!draft.trim()}
          className={cn(
            "size-11 items-center justify-center rounded-full",
            draft.trim() ? "bg-primary" : "bg-muted"
          )}
        >
          <SendHorizonal
            size={18}
            color={draft.trim() ? colors.primaryForeground : colors.mutedForeground}
          />
        </Pressable>
      </View>
    </Screen>
  )
}
