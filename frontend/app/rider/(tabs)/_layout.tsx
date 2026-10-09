import { Tabs } from "expo-router"
import { History, Home, ListChecks, Navigation } from "lucide-react-native"

import { useThemeColors } from "@/theme"

export default function RiderTabs() {
  const colors = useThemeColors()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.foreground,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <ListChecks color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="active-trip"
        options={{
          title: "Trip",
          tabBarIcon: ({ color, size }) => (
            <Navigation color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => (
            <History color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
