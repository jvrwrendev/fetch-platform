import { View } from "react-native"

import BookingCard from "@/components/BookingCard"
import { PageHeader, Screen } from "@/components/layout/Screen"
import { StatCard } from "@/components/StatCard"
import { Text } from "@/components/ui/text"
import { useAsync } from "@/hooks/useAsync"
import { mockAdminApi } from "@/services/mock"
import { peso } from "@/utils/format"

export default function AdminDashboardScreen() {
  const { data: stats } = useAsync(() => mockAdminApi.dashboardStats())
  const { data: bookings } = useAsync(() => mockAdminApi.listBookings())
  const recent = (bookings ?? []).slice(0, 5)

  return (
    <Screen>
      <PageHeader
        title="Dashboard"
        description="Platform health at a glance."
      />

      <View className="flex-row flex-wrap gap-3">
        <StatCard
          className="min-w-[45%] flex-1"
          label="Passengers"
          value={stats?.totalPassengers ?? "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Riders"
          value={stats?.totalRiders ?? "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Bookings"
          value={stats?.totalBookings ?? "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Active trips"
          value={stats?.activeTrips ?? "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Revenue"
          value={stats ? peso(stats.totalRevenue) : "—"}
        />
      </View>

      <Text className="text-lg font-semibold tracking-tight">
        Recent bookings
      </Text>
      {recent.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </Screen>
  )
}
