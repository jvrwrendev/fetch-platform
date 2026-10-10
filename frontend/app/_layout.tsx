import "@/theme/global.css"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { ConvexProvider } from "convex/react"
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
