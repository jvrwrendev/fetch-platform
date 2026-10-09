import { useRouter } from "expo-router"
import { Car, MapPin, ShieldCheck } from "lucide-react-native"
import type { ReactNode } from "react"
import { ScrollView, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/store/AuthContext"
import { useThemeColors } from "@/theme"

export default function Landing() {
  const { user, ready } = useAuth()
  const router = useRouter()
  const colors = useThemeColors()

  const go = () => {
    if (user) {
      router.push(user.role === "rider" ? "/rider/dashboard" : "/passenger/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="mx-auto w-full max-w-3xl flex-1 gap-10 px-6 py-10">
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="flex-row items-center gap-2"
          >
            <View className="size-9 items-center justify-center rounded-xl bg-primary">
              <Car size={20} color={colors.primaryForeground} />
            </View>
            <Text className="text-xl font-bold tracking-tight">Fetch</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120)} className="gap-4">
            <Text className="text-4xl font-bold tracking-tight">
              Rides across the metro, in a couple of taps.
            </Text>
            <Text className="text-base text-muted-foreground">
              Book a motor, sedan or SUV, watch your rider arrive in real time,
              and settle up your way. This is a mock build — no real money, no
              real cars.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220)} className="gap-3">
            <Feature icon={<MapPin size={18} color={colors.foreground} />} title="Live tracking">
              Pick a pickup and a drop-off, then follow the ride from request to
              receipt.
            </Feature>
            <Feature
              icon={<ShieldCheck size={18} color={colors.foreground} />}
              title="Transparent fares"
            >
              One fare engine shared across the passenger, rider and admin
              experiences.
            </Feature>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320)} className="mt-auto gap-3">
            <Button onPress={go} disabled={!ready}>
              {user
                ? user.role === "rider"
                  ? "Rider dashboard"
                  : "Passenger home"
                : "Get started"}
            </Button>
            {!user && ready ? (
              <Button variant="outline" onPress={() => router.push("/login")}>
                Use a demo account
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onPress={() => router.push("/admin/dashboard")}
            >
              Admin console
            </Button>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <View className="flex-row items-start gap-3 rounded-xl border border-border bg-card p-4">
      <View className="size-9 items-center justify-center rounded-lg bg-secondary">
        {icon}
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-medium">{title}</Text>
        <Text className="text-sm text-muted-foreground">{children}</Text>
      </View>
    </View>
  )
}
