import { Tabs } from "expo-router"
import { History, Home, ListChecks, Navigation, User } from "lucide-react-native"

export default function RiderTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#171717",
        tabBarInactiveTintColor: "#737373",
        tabBarStyle: { borderTopColor: "#e5e5e5", backgroundColor: "#ffffff" },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <ListChecks color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: "Active",
          tabBarIcon: ({ color, size }) => (
            <Navigation color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <History color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
