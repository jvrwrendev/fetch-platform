import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { StatusBadge } from "@/components/StatusBadge"
import { Text } from "@/components/ui/text"
import { UserCard } from "@/components/UserCard"
import { useAsync } from "@/hooks/useAsync"
import { mockAdminApi } from "@/services/mock"
import { peso } from "@/utils/format"

export default function AdminPassengersScreen() {
  const { data: passengers } = useAsync(() => mockAdminApi.listPassengers())
  const rows = passengers ?? []

  return (
    <Screen>
      <PageHeader title="Passengers" description={`${rows.length} registered`} />

      {rows.map((passenger) => (
        <UserCard
          key={passenger.id}
          name={passenger.name}
          subtitle={`${passenger.totalTrips} trips · ${peso(passenger.totalSpend)} spent`}
          right={<StatusBadge status={passenger.status} variant={passenger.status === "active" ? "success" : "secondary"} />}
        />
      ))}

      {rows.length === 0 ? (
        <View className="rounded-xl border border-border bg-card p-8">
          <Text className="text-center text-sm text-muted-foreground">
            Loading passengers…
          </Text>
        </View>
      ) : null}
    </Screen>
  )
}
