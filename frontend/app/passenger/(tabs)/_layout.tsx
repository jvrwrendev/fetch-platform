import { Tabs } from "expo-router"
import { History, Home, MapPin, MessageCircle } from "lucide-react-native"

import { useAuth } from "@/store/AuthContext"
import { useBookings } from "@/store/BookingsContext"
import { useChats } from "@/store/ChatsContext"
import { useThemeColors } from "@/theme"

export default function PassengerTabs() {
  const colors = useThemeColors()
  const { user } = useAuth()
  const { bookings } = useBookings()
  const { unreadFor } = useChats()

  const unread = user
    ? unreadFor(
        user.id,
        bookings
          .filter((booking) => booking.passengerId === user.id)
          .map((booking) => booking.id)
      )
    : 0

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
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Book",
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Trips",
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  )
}
