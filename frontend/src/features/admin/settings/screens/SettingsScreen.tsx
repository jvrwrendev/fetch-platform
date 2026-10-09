import { useEffect, useState } from "react"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import type { AdminSettings } from "@/shared"
import { mockAdminApi } from "@/services/mock"
import { useTheme, type ThemePreference } from "@/store/ThemeContext"
import { cn } from "@/utils/cn"

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const { preference, setPreference } = useTheme()

  useEffect(() => {
    mockAdminApi.getSettings().then(setSettings)
  }, [])

  const toggle = (key: keyof AdminSettings) => {
    setSettings((prev) => {
      if (!prev || typeof prev[key] !== "boolean") return prev
      return { ...prev, [key]: !prev[key] }
    })
  }

  return (
    <Screen>
      <PageHeader title="Settings" description="Console preferences." />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <ToggleRow
            label="Email notifications"
            value={settings?.emailNotifications ?? false}
            onToggle={() => toggle("emailNotifications")}
          />
          <ToggleRow
            label="Booking alerts"
            value={settings?.bookingAlerts ?? false}
            onToggle={() => toggle("bookingAlerts")}
          />
          <ToggleRow
            label="Rider approval alerts"
            value={settings?.riderApprovalAlerts ?? false}
            onToggle={() => toggle("riderApprovalAlerts")}
          />
          <ToggleRow
            label="Weekly report digest"
            value={settings?.weeklyReportDigest ?? false}
            onToggle={() => toggle("weeklyReportDigest")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Locale</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          <Row label="Currency" value={settings?.currency ?? "—"} />
          <Row label="Timezone" value={settings?.timezone ?? "—"} />
          <Row label="Language" value={settings?.language ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Text className="text-sm text-muted-foreground">
            Follow the system, or pin the app to light or dark.
          </Text>
          <View className="flex-row gap-2">
            {THEME_OPTIONS.map((option) => {
              const active = preference === option.value
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setPreference(option.value)}
                  className={cn(
                    "flex-1 items-center rounded-md border py-2",
                    active
                      ? "border-primary bg-primary"
                      : "border-border bg-background"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </CardContent>
      </Card>
    </Screen>
  )
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-sm">{label}</Text>
      <Switch value={value} onValueChange={onToggle} />
    </View>
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
