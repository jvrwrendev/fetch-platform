import { useRouter } from "expo-router"
import { ArrowLeft, Car, LogOut } from "lucide-react-native"
import { useEffect, useState, type ReactNode } from "react"
import { Pressable, View } from "react-native"

import { AppearanceCard } from "@/components/AppearanceCard"
import { ServiceAreaCard } from "@/components/ServiceAreaCard"
import { PageHeader, Screen } from "@/components/layout/Screen"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useSettings } from "@/store/SettingsContext"
import { useThemeColors } from "@/theme"

export default function RiderSettings() {
  const router = useRouter()
  const { user, updateProfile, logout } = useAuth()
  const { settings, update } = useSettings()
  const [model, setModel] = useState(user?.vehicleModel ?? "")
  const [plate, setPlate] = useState(user?.plateNumber ?? "")
  const colors = useThemeColors()

  const online = Boolean(user?.online)

  useEffect(() => {
    setModel(user?.vehicleModel ?? "")
    setPlate(user?.plateNumber ?? "")
  }, [user?.vehicleModel, user?.plateNumber])

  const saveVehicle = () => {
    updateProfile({ vehicleModel: model.trim(), plateNumber: plate.trim() })
    toast.success("Vehicle updated")
  }

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
          description="How you work on the platform."
        />
      </View>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <Row
            label={online ? "Online" : "Offline"}
            description={
              online
                ? "You are receiving ride requests."
                : "You will not receive requests while offline."
            }
          >
            <Switch
              value={online}
              onValueChange={(next) => {
                updateProfile({ online: next })
                toast(next ? "You are online" : "You are offline")
              }}
            />
          </Row>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <Row label="Trip updates" description="New requests and trip changes">
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
        <CardHeader className="flex-row items-center gap-2">
          <Car size={16} color={colors.foreground} />
          <CardTitle className="text-base">Vehicle</CardTitle>
        </CardHeader>
        <CardContent className="gap-3">
          <View className="gap-2">
            <Label>Model</Label>
            <Input
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Honda Click 160"
            />
          </View>
          <View className="gap-2">
            <Label>Plate number</Label>
            <Input
              value={plate}
              onChangeText={setPlate}
              autoCapitalize="characters"
              placeholder="e.g. ABC 1234"
            />
          </View>
          <Button onPress={saveVehicle}>Save vehicle</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted-foreground">Verification</Text>
            <Badge variant="success">Approved</Badge>
          </View>
          <Row label="Rating" description="Across all completed trips">
            <Text className="text-sm font-medium">{user?.rating.toFixed(1)} ★</Text>
          </Row>
          <Row label="Total trips" description="Since you joined">
            <Text className="text-sm font-medium">{user?.totalTrips ?? 0}</Text>
          </Row>
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
