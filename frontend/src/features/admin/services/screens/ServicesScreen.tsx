import { useEffect, useState } from "react"
import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { RIDE_SERVICES } from "@/data/mock"
import { SURGE_MAX, SURGE_MIN, SURGE_STEP, type FareConfig } from "@/shared"
import { mockAdminApi } from "@/services/mock"
import { peso } from "@/utils/format"

export default function AdminServicesScreen() {
  const [config, setConfig] = useState<FareConfig | null>(null)

  useEffect(() => {
    mockAdminApi.getFareConfig().then(setConfig)
  }, [])

  const adjustSurge = (delta: number) => {
    setConfig((prev) => {
      if (!prev) return prev
      const next = Math.min(
        SURGE_MAX,
        Math.max(SURGE_MIN, Math.round((prev.surgeMultiplier + delta) * 10) / 10)
      )
      return { ...prev, surgeMultiplier: next }
    })
  }

  const save = async () => {
    if (!config) return
    await mockAdminApi.saveFareConfig(config)
    toast.success("Fare rates saved")
  }

  return (
    <Screen>
      <PageHeader
        title="Fare rates"
        description="The one source of truth for pricing."
      />

      <View className="gap-3">
        {RIDE_SERVICES.map((service) => {
          const rate = config?.vehicle[service.id] ?? {
            base: service.base,
            perKm: service.perKm,
          }
          return (
            <Card key={service.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="gap-2">
                <Row label="Base fare" value={peso(rate.base)} />
                <Row label="Per kilometre" value={peso(rate.perKm)} />
              </CardContent>
            </Card>
          )
        })}
      </View>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Surge multiplier</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <View className="flex-row items-center justify-between">
            <Button variant="outline" size="sm" onPress={() => adjustSurge(-SURGE_STEP)}>
              <Text className="text-sm font-medium">−</Text>
            </Button>
            <Text className="text-lg font-semibold">
              {config ? `${config.surgeMultiplier.toFixed(1)}×` : "—"}
            </Text>
            <Button variant="outline" size="sm" onPress={() => adjustSurge(SURGE_STEP)}>
              <Text className="text-sm font-medium">+</Text>
            </Button>
          </View>
          <Row
            label="Booking fee"
            value={config ? peso(config.bookingFee) : "—"}
          />
          <Row label="Minimum fare" value={config ? peso(config.minFare) : "—"} />
        </CardContent>
      </Card>

      <Button onPress={save}>
        <Text className="text-sm font-medium text-primary-foreground">
          Save fare rates
        </Text>
      </Button>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm text-muted-foreground">{label}</Text>
      <Text className="text-sm font-medium">{value}</Text>
    </View>
  )
}
