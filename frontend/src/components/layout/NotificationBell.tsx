import { Bell } from "lucide-react-native"
import { useState } from "react"
import { Pressable, View } from "react-native"

import { HeaderPanel } from "@/components/layout/HeaderPanel"
import { Text } from "@/components/ui/text"
import { useNotifications } from "@/store/NotificationsContext"
import { useThemeColors } from "@/theme"
import { relativeTime } from "@/utils/format"

/** The header bell: unread badge, and a panel of trip/system notices. */
export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { notifications, unreadCount, markAllRead, markRead } =
    useNotifications()
  const colors = useThemeColors()

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Notifications"
        className="size-9 items-center justify-center rounded-full border border-border"
      >
        <Bell size={18} color={colors.foreground} />
        {unreadCount > 0 ? (
          <View className="absolute -right-1 -top-1 min-w-4 items-center justify-center rounded-full bg-primary px-1">
            <Text className="text-[10px] font-semibold leading-4 text-primary-foreground">
              {unreadCount}
            </Text>
          </View>
        ) : null}
      </Pressable>

      <HeaderPanel
        open={open}
        onClose={() => setOpen(false)}
        title="Notifications"
      >
        {unreadCount > 0 ? (
          <Pressable onPress={markAllRead} className="mb-2 self-end">
            <Text className="text-xs font-medium text-primary">
              Mark all read
            </Text>
          </Pressable>
        ) : null}

        {notifications.length === 0 ? (
          <Text className="py-6 text-center text-sm text-muted-foreground">
            Nothing yet.
          </Text>
        ) : (
          notifications.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => markRead(item.id)}
              className={
                item.read
                  ? "border-b border-border py-3"
                  : "border-b border-border bg-secondary/60 px-2 py-3"
              }
            >
              <View className="flex-row items-center gap-2">
                <Text className="flex-1 text-sm font-medium">{item.title}</Text>
                {!item.read ? (
                  <View className="size-2 rounded-full bg-primary" />
                ) : null}
              </View>
              <Text className="mt-0.5 text-xs leading-5 text-muted-foreground">
                {item.message}
              </Text>
              <Text className="mt-1 text-[11px] text-muted-foreground">
                {relativeTime(item.createdAt)}
              </Text>
            </Pressable>
          ))
        )}
      </HeaderPanel>
    </>
  )
}
