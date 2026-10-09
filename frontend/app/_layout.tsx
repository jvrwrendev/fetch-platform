import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ToastHost } from "@/components/ui/toast"
import { AuthProvider } from "@/features/auth/AuthContext"
import { BookingsProvider } from "@/features/bookings/BookingsContext"

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <BookingsProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#ffffff" },
              }}
            />
            <ToastHost />
          </BookingsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
