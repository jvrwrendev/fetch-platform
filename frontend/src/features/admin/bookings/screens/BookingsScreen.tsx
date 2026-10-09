import { useMemo, useState } from "react"
import { Pressable, View } from "react-native"

import BookingCard from "@/components/BookingCard"
import { PageHeader, Screen } from "@/components/layout/Screen"
import { Text } from "@/components/ui/text"
import { useAsync } from "@/hooks/useAsync"
import type { TripStatus } from "@/shared"
import { mockAdminApi } from "@/services/mock"

const FILTERS: (TripStatus | "all")[] = [
  "all",
  "searching",
  "accepted",
  "arriving",
  "in_progress",
  "completed",
  "cancelled",
]

export default function AdminBookingsScreen() {
  const { data: bookings } = useAsync(() => mockAdminApi.listBookings())
  const [filter, setFilter] = useState<TripStatus | "all">("all")

  const rows = useMemo(() => {
    const list = bookings ?? []
    return filter === "all" ? list : list.filter((b) => b.status === filter)
  }, [bookings, filter])

  return (
    <Screen>
      <PageHeader title="Bookings" description={`${rows.length} shown`} />

      <View className="flex-row flex-wrap gap-2">
        {FILTERS.map((option) => {
          const selected = filter === option
          return (
            <Pressable
              key={option}
              onPress={() => setFilter(option)}
              className={
                selected
                  ? "rounded-full border border-primary bg-primary px-3 py-1.5"
                  : "rounded-full border border-border bg-background px-3 py-1.5"
              }
            >
              <Text
                className={
                  selected
                    ? "text-xs capitalize text-primary-foreground"
                    : "text-xs capitalize"
                }
              >
                {option.replace(/_/g, " ")}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {rows.slice(0, 40).map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </Screen>
  )
}
