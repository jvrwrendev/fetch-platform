import { Redirect, Stack } from "expo-router"

import { Loading } from "@/components/layout/Loading"
import { useAuth } from "@/store/AuthContext"

export default function PassengerLayout() {
  const { user, ready } = useAuth()
  if (!ready) return <Loading />
  if (!user) return <Redirect href="/login" />
  if (user.role !== "passenger") return <Redirect href="/rider/dashboard" />

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
      }}
    />
  )
}
