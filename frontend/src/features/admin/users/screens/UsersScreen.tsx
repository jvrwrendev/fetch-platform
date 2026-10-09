import { useMemo, useState } from "react"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Badge } from "@/components/ui/badge"
import { Text } from "@/components/ui/text"
import { UserCard } from "@/components/UserCard"
import { ADMIN_PROFILE } from "@/data/mock"
import { useAsync } from "@/hooks/useAsync"
import { mockAdminApi } from "@/services/mock"

type UserRow = { id: string; name: string; subtitle: string; role: string }

export default function AdminUsersScreen() {
  const { data: passengers } = useAsync(() => mockAdminApi.listPassengers())
  const { data: riders } = useAsync(() => mockAdminApi.listRiders())
  const [filter, setFilter] = useState<"all" | "passenger" | "rider" | "admin">(
    "all"
  )

  const rows = useMemo<UserRow[]>(() => {
    const list: UserRow[] = [
      {
        id: ADMIN_PROFILE.id,
        name: ADMIN_PROFILE.name,
        subtitle: ADMIN_PROFILE.email,
        role: "admin",
      },
      ...(passengers ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: p.email,
        role: "passenger",
      })),
      ...(riders ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        subtitle: r.email,
        role: "rider",
      })),
    ]
    return filter === "all" ? list : list.filter((row) => row.role === filter)
  }, [passengers, riders, filter])

  return (
    <Screen>
      <PageHeader title="Users" description={`${rows.length} accounts`} />

      <View className="flex-row flex-wrap gap-2">
        {(["all", "passenger", "rider", "admin"] as const).map((option) => {
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
                  selected ? "text-xs capitalize text-primary-foreground" : "text-xs capitalize"
                }
              >
                {option}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {rows.map((row) => (
        <UserCard
          key={row.id}
          name={row.name}
          subtitle={row.subtitle}
          right={
            <Badge variant="outline">
              <Text className="text-xs capitalize">{row.role}</Text>
            </Badge>
          }
        />
      ))}
    </Screen>
  )
}
