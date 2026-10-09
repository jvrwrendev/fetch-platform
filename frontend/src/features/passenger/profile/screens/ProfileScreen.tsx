import { useRouter } from "expo-router"
import { ArrowLeft, LogOut, Settings as SettingsIcon } from "lucide-react-native"
import { useEffect, useState } from "react"
import { Pressable, View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Avatar, initialsOf } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { useThemeColors } from "@/theme"

export default function PassengerProfile() {
  const { user, updateProfile, logout } = useAuth()
  const { bookings } = useBookings()
  const router = useRouter()
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")

  useEffect(() => {
    setName(user?.name ?? "")
    setPhone(user?.phone ?? "")
  }, [user?.name, user?.phone])

  const trips = bookings.filter((booking) => booking.passengerId === user?.id)

  const colors = useThemeColors()

  const save = () => {
    updateProfile({ name, phone })
    toast.success("Profile updated")
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
        <PageHeader title="Profile" />
      </View>

      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <Avatar initials={initialsOf(user?.name ?? "Fetch")} />
          <View className="flex-1 gap-0.5">
            <CardTitle>{user?.name}</CardTitle>
            <Text className="text-sm text-muted-foreground">{user?.email}</Text>
          </View>
        </CardHeader>
        <CardContent>
          <Row label="Rating" value={`${user?.rating.toFixed(1)} ★`} />
          <Row label="Total trips" value={String(user?.totalTrips ?? 0)} />
          <Row label="Trips here" value={String(trips.length)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="gap-2">
            <Label>Full name</Label>
            <Input value={name} onChangeText={setName} />
          </View>
          <View className="gap-2">
            <Label>Phone</Label>
            <Input
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
          <Button onPress={save}>Save changes</Button>
        </CardContent>
      </Card>

      <Button variant="outline" onPress={() => router.push("/passenger/settings")}>
        <SettingsIcon size={16} color={colors.foreground} />
        <Text className="text-sm font-medium">Settings</Text>
      </Button>

      <Button
        variant="outline"
        onPress={() => {
          logout()
        }}
      >
        <LogOut size={16} color={colors.foreground} />
        <Text className="text-sm font-medium">Sign out</Text>
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
