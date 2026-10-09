import { useRouter } from "expo-router"
import { Car, Navigation } from "lucide-react-native"
import { useState } from "react"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

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
import { useAuth } from "@/store/AuthContext"
import { useThemeColors } from "@/theme"
import type { Role } from "@/shared"

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const colors = useThemeColors()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const signIn = (role: Role) => {
    login(role)
    router.replace(role === "rider" ? "/rider/dashboard" : "/passenger/dashboard")
  }

  return (
    <SafeAreaView className="flex-1 bg-muted/30">
      <View className="mx-auto w-full max-w-md flex-1 justify-center gap-6 px-4">
        <View className="items-center gap-1">
          <Text className="text-3xl font-bold tracking-tight">Fetch</Text>
          <Text className="text-center text-sm text-muted-foreground">
            Sign in with a demo account to continue
          </Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>Demo Login</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="gap-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View className="gap-2">
              <Label>Password</Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />
            </View>
            <Text className="text-xs text-muted-foreground">
              Any credentials work — pick your role:
            </Text>
            <View className="flex-row gap-3">
              <Button className="flex-1" onPress={() => signIn("passenger")}>
                <Navigation size={16} color={colors.primaryForeground} />
                <Text className="text-sm font-medium text-primary-foreground">
                  Passenger
                </Text>
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onPress={() => signIn("rider")}
              >
                <Car size={16} color={colors.foreground} />
                <Text className="text-sm font-medium">Rider</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        <Button variant="ghost" onPress={() => router.replace("/")}>
          Back to home
        </Button>
      </View>
    </SafeAreaView>
  )
}
