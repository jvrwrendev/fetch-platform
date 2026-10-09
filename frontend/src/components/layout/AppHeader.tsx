import { LogOut } from "lucide-react-native"
import { Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Avatar, initialsOf } from "@/components/ui/avatar"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/features/auth/AuthContext"

/**
 * The persistent bar the original web shell had: brand on the left, the signed
 * in identity and a log-out affordance on the right. It replaces the navigator
 * header for the tabbed screens; page titles still live in each screen.
 */
export function AppHeader() {
  const { user, logout } = useAuth()
  const insets = useSafeAreaInsets()

  return (
    <View
      className="border-b border-border bg-card px-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="mx-auto h-14 w-full max-w-2xl flex-row items-center gap-3">
        <Text className="text-lg font-bold tracking-tight">Fetch</Text>
        <View className="ml-auto flex-row items-center gap-2">
          <Avatar
            initials={initialsOf(user?.name ?? "Fetch")}
            className="size-8"
          />
          <Text className="shrink text-sm" numberOfLines={1}>
            {user?.name}
          </Text>
          <Pressable
            onPress={logout}
            accessibilityLabel="Log out"
            className="size-9 items-center justify-center rounded-full"
          >
            <LogOut size={18} color="#171717" />
          </Pressable>
        </View>
      </View>
    </View>
  )
}
