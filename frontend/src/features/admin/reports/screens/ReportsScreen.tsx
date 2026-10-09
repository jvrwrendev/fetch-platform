import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { StatCard } from "@/components/StatCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { VEHICLE_LABELS } from "@/shared"
import { useAsync } from "@/hooks/useAsync"
import { mockAdminApi } from "@/services/mock"
import { peso } from "@/utils/format"

export default function AdminReportsScreen() {
  const { data } = useAsync(() => mockAdminApi.reports(30))
  const kpis = data?.kpis

  return (
    <Screen>
      <PageHeader title="Reports" description="Last 30 days" />

      <View className="flex-row flex-wrap gap-3">
        <StatCard
          className="min-w-[45%] flex-1"
          label="Revenue"
          value={kpis ? peso(kpis.totalRevenue) : "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Bookings"
          value={kpis?.totalBookings ?? "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Avg fare"
          value={kpis ? peso(kpis.avgFare) : "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Completion"
          value={kpis ? `${kpis.completionRate}%` : "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Cancel rate"
          value={kpis ? `${kpis.cancelRate}%` : "—"}
        />
        <StatCard
          className="min-w-[45%] flex-1"
          label="Avg rating"
          value={kpis?.avgRating ?? "—"}
        />
      </View>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">By vehicle</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          {(data?.bookingsByVehicle ?? []).map((row) => (
            <View
              key={row.vehicle}
              className="flex-row items-center justify-between"
            >
              <Text className="text-sm text-muted-foreground">
                {VEHICLE_LABELS[row.vehicle]}
              </Text>
              <Text className="text-sm font-medium">
                {row.count} · {peso(row.revenue)}
              </Text>
            </View>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top routes</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          {(data?.topRoutes ?? []).map((row) => (
            <View
              key={row.route}
              className="flex-row items-center justify-between gap-4"
            >
              <Text className="flex-1 text-sm text-muted-foreground" numberOfLines={1}>
                {row.route}
              </Text>
              <Text className="text-sm font-medium">{row.count}</Text>
            </View>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Top riders</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          {(data?.topRiders ?? []).map((row) => (
            <View
              key={row.id}
              className="flex-row items-center justify-between gap-4"
            >
              <Text className="flex-1 text-sm text-muted-foreground" numberOfLines={1}>
                {row.name}
              </Text>
              <Text className="text-sm font-medium">
                {row.trips} · {peso(row.revenue)}
              </Text>
            </View>
          ))}
        </CardContent>
      </Card>
    </Screen>
  )
}
