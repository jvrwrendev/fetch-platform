import { Car, LogOut } from "lucide-react-native"
import { useEffect, useState } from "react"
import { View } from "react-native"

import { PageHeader, Screen } from "@/components/layout/Screen"
import { Avatar, initialsOf } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { useThemeColors } from "@/theme"
import { peso } from "@/utils/format"

export default function RiderProfile() {
  const { user, updateProfile, logout } = useAuth()
  const { bookings } = useBookings()
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")

  useEffect(() => {
    setName(user?.name ?? "")
    setPhone(user?.phone ?? "")
  }, [user?.name, user?.phone])

  const mine = bookings.filter((booking) => booking.riderId === user?.id)
  const earnings = mine
    .filter((booking) => booking.status === "completed")
    .reduce((sum, booking) => sum + booking.fare.total, 0)

  const colors = useThemeColors()

  const save = () => {
    updateProfile({ name, phone })
    toast.success("Profile updated")
  }

  return (
    <Screen header>
      <PageHeader title="Rider profile" />

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
          <Row label="Earnings here" value={peso(earnings)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Car size={16} color={colors.foreground} />
          <CardTitle className="text-base">Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          <Row label="Model" value={user?.vehicleModel ?? "—"} />
          <Row label="Plate" value={user?.plateNumber ?? "—"} />
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

      <Button variant="outline" onPress={logout}>
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
      <Text className="text-sm font-medium" numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}
