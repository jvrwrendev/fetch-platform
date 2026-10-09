import { useRouter } from "expo-router"
import { Car, Navigation } from "lucide-react-native"
import { useState } from "react"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/features/auth/AuthContext"
import type { Role } from "@/shared"

export default function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("alex@example.com")

  const signIn = (role: Role) => {
    login(role)
    router.replace(role === "rider" ? "/rider" : "/passenger")
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mx-auto w-full max-w-md flex-1 justify-center gap-6 px-6">
        <View className="items-center gap-2">
          <View className="size-12 items-center justify-center rounded-2xl bg-primary">
            <Car size={24} color="#fafafa" />
          </View>
          <Text className="text-2xl font-bold tracking-tight">
            Welcome to Fetch
          </Text>
          <Text className="text-center text-sm text-muted-foreground">
            Pick a demo account to continue. No password needed in this build.
          </Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Demo credentials are pre-filled.</CardDescription>
          </CardHeader>
          <CardContent>
            <View className="gap-2">
              <Label>Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View className="gap-2">
              <Label>Password</Label>
              <Input value="demo1234" secureTextEntry editable={false} />
            </View>
            <View className="gap-3 pt-1">
              <Button onPress={() => signIn("passenger")}>
                <Navigation size={16} color="#fafafa" />
                <Text className="text-sm font-medium text-primary-foreground">
                  Continue as passenger
                </Text>
              </Button>
              <Button variant="outline" onPress={() => signIn("rider")}>
                <Car size={16} color="#171717" />
                <Text className="text-sm font-medium">Continue as rider</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        <Button variant="ghost" onPress={() => router.back()}>
          Back
        </Button>
      </View>
    </SafeAreaView>
  )
}
