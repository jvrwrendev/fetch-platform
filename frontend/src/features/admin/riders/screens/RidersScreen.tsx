import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { StatusBadge } from "@/components/StatusBadge"
import { Text } from "@/components/ui/text"
import { UserCard } from "@/components/UserCard"
import { useAsync } from "@/hooks/useAsync"
import { mockAdminApi } from "@/services/mock"

export default function AdminRidersScreen() {
  const { data: riders } = useAsync(() => mockAdminApi.listRiders())
  const rows = riders ?? []

  return (
    <Screen>
      <PageHeader title="Riders" description={`${rows.length} registered`} />

      {rows.map((rider) => (
        <UserCard
          key={rider.id}
          name={rider.name}
          subtitle={`${rider.vehicle.type.toUpperCase()} · ${rider.vehicle.plateNumber} · ★ ${rider.rating}`}
          right={
            <View className="items-end gap-1">
              <StatusBadge
                status={rider.approval}
                variant={
                  rider.approval === "approved"
                    ? "success"
                    : rider.approval === "pending"
                      ? "secondary"
                      : "destructive"
                }
              />
              <StatusBadge status={rider.availability} variant="outline" />
            </View>
          }
        />
      ))}
    </Screen>
  )
}
