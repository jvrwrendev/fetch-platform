import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AccountMenu } from "@/components/layout/AccountMenu"
import { NotificationBell } from "@/components/layout/NotificationBell"
import { Text } from "@/components/ui/text"

/**
 * The persistent bar the original web shell had: brand on the left, the
 * notification bell and the account control on the right. It replaces the
 * navigator header for the tabbed screens; page titles still live in each
 * screen, and Profile/Settings hang off the account avatar.
 */
export function AppHeader() {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="border-b border-border bg-card px-4"
      style={{ paddingTop: insets.top }}
    >
      <View className="mx-auto h-14 w-full max-w-2xl flex-row items-center gap-3">
        <Text className="text-lg font-bold tracking-tight">Fetch</Text>
        <View className="ml-auto flex-row items-center gap-2">
          <NotificationBell />
          <AccountMenu />
        </View>
      </View>
    </View>
  )
}
