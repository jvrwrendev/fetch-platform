import "@/theme/global.css"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ToastHost } from "@/components/ui/toast"
import { AuthProvider } from "@/store/AuthContext"
import { BookingsProvider } from "@/store/BookingsContext"
import { ThemeProvider, useTheme } from "@/store/ThemeContext"
import { useThemeColors } from "@/theme"

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <BookingsProvider>
              <ThemedStack />
              <ToastHost />
            </BookingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
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
