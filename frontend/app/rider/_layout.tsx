import { Redirect, Stack } from "expo-router"

import { Loading } from "@/components/layout/Loading"
import { useAuth } from "@/store/AuthContext"
import { useThemeColors } from "@/theme"

export default function RiderLayout() {
  const { user, ready } = useAuth()
  const colors = useThemeColors()
  if (!ready) return <Loading />
  if (!user) return <Redirect href="/login" />
  if (user.role !== "rider") return <Redirect href="/passenger/dashboard" />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  )
}
