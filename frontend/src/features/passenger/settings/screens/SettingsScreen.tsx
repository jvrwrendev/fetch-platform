import { ArrowLeft, LogOut, Plus, X } from "lucide-react-native"
import { useState, type ReactNode } from "react"
import { Pressable, View } from "react-native"
import { useRouter } from "expo-router"

import { AppearanceCard } from "@/components/AppearanceCard"
import { ServiceAreaCard } from "@/components/ServiceAreaCard"
import { PageHeader, Screen } from "@/components/layout/Screen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useSettings } from "@/store/SettingsContext"
import { LOCATIONS, PAYMENT_METHODS, type PaymentMethod } from "@/shared"
import { useThemeColors } from "@/theme"
import { cn } from "@/utils/cn"

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  gcash: "GCash",
  maya: "Maya",
}

export default function PassengerSettings() {
  const router = useRouter()
  const { logout } = useAuth()
  const { settings, update, addSavedPlace, removeSavedPlace } = useSettings()
  const [adding, setAdding] = useState(false)
  const colors = useThemeColors()

  return (
    <Screen>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => router.back()}
          className="size-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft size={16} color={colors.foreground} />
        </Pressable>
        <PageHeader
          title="Settings"
          description="Preferences for your account."
        />
      </View>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Row label="Trip updates" description="Ride status and rider updates">
            <Switch
              value={settings.tripUpdates}
              onValueChange={(tripUpdates) => update({ tripUpdates })}
            />
          </Row>
          <Row label="Promos and news" description="Occasional announcements">
            <Switch
              value={settings.promos}
              onValueChange={(promos) => update({ promos })}
            />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Default payment</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Text className="text-sm text-muted-foreground">
            What the booking flow selects first.
          </Text>
          <View className="flex-row gap-2">
            {PAYMENT_METHODS.map((method) => {
              const active = settings.defaultPaymentMethod === method
              return (
                <Pressable
                  key={method}
                  onPress={() => update({ defaultPaymentMethod: method })}
                  className={cn(
                    "flex-1 items-center rounded-lg border p-3",
                    active ? "border-primary bg-primary" : "border-border"
                  )}
                >
                  <Text
                    className={cn(
                      "text-sm font-medium",
                      active ? "text-primary-foreground" : "text-foreground"
                    )}
                  >
                    {PAYMENT_LABEL[method]}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Saved places</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          {settings.savedPlaces.length === 0 ? (
            <Text className="text-sm text-muted-foreground">
              No saved places yet.
            </Text>
          ) : (
            settings.savedPlaces.map((place) => (
              <View key={place.id} className="flex-row items-center gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="text-sm font-medium">{place.label}</Text>
                  <Text
                    className="text-xs text-muted-foreground"
                    numberOfLines={1}
                  >
                    {place.point.name}
                  </Text>
                </View>
                <Pressable
                  onPress={() => removeSavedPlace(place.id)}
                  className="size-9 items-center justify-center rounded-md border border-border"
                >
                  <X size={16} color={colors.foreground} />
                </Pressable>
              </View>
            ))
          )}

          {adding ? (
            <View className="gap-2">
              <Text className="text-xs text-muted-foreground">
                Pick a place to save
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {LOCATIONS.map((location) => (
                  <Pressable
                    key={location.name}
                    onPress={() => {
                      addSavedPlace(location.name, location)
                      setAdding(false)
                      toast.success("Place saved")
                    }}
                    className="rounded-full border border-border px-3 py-1.5"
                  >
                    <Text className="text-xs">{location.name}</Text>
                  </Pressable>
                ))}
              </View>
              <Button variant="ghost" size="sm" onPress={() => setAdding(false)}>
                <Text className="text-sm font-medium">Cancel</Text>
              </Button>
            </View>
          ) : (
            <Button variant="outline" size="sm" onPress={() => setAdding(true)}>
              <Plus size={14} color={colors.foreground} />
              <Text className="text-sm font-medium">Add a place</Text>
            </Button>
          )}
        </CardContent>
      </Card>

      <ServiceAreaCard />
      <AppearanceCard />

      <Button variant="outline" onPress={logout}>
        <LogOut size={16} color={colors.foreground} />
        <Text className="text-sm font-medium">Sign out</Text>
      </Button>
    </Screen>
  )
}

function Row({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: ReactNode
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="min-w-0 flex-1">
        <Text className="text-sm font-medium">{label}</Text>
        <Text className="text-xs text-muted-foreground">{description}</Text>
      </View>
      {children}
    </View>
  )
}
