import "@/theme/global.css"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ConvexProvider } from "convex/react"
import { useEffect } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ToastHost } from "@/components/ui/toast"
import { convex } from "@/services/convex/client"
import { AuthProvider } from "@/store/AuthContext"
import { BookingsProvider } from "@/store/BookingsContext"
import { ChatsProvider } from "@/store/ChatsContext"
import { NotificationsProvider } from "@/store/NotificationsContext"
import { SettingsProvider } from "@/store/SettingsContext"
import { ThemeProvider, useTheme } from "@/store/ThemeContext"
import { useThemeColors } from "@/theme"

export default function RootLayout() {
  // The mock era persisted bookings/chat/notifications on the device; the
  // backend owns them now, so drop any leftovers from a previous install.
  useEffect(() => {
    void AsyncStorage.multiRemove([
      "fetch_bookings_v2",
      "fetch_chats",
      "fetch_notifications",
    ])
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConvexProvider client={convex}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <SettingsProvider>
                <NotificationsProvider>
                  <BookingsProvider>
                    <ChatsProvider>
                      <ThemedStack />
                      <ToastHost />
                    </ChatsProvider>
                  </BookingsProvider>
                </NotificationsProvider>
              </SettingsProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </ConvexProvider>
    </GestureHandlerRootView>
  )
}

function ThemedStack() {
  const { scheme } = useTheme()
  const colors = useThemeColors()

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </>
  )
}
