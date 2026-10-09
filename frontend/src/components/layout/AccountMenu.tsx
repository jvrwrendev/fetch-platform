import { useRouter } from "expo-router"
import { LogOut, Settings as SettingsIcon, User as UserIcon } from "lucide-react-native"
import { useState, type ReactNode } from "react"
import { Pressable, View } from "react-native"

import { HeaderPanel } from "@/components/layout/HeaderPanel"
import { Avatar, initialsOf } from "@/components/ui/avatar"
import { Text } from "@/components/ui/text"
import { useAuth } from "@/store/AuthContext"
import { useThemeColors } from "@/theme"

/**
 * The account control: the identity plus the two surfaces that used to have
 * their own bottom tab (Profile and Settings), and sign out. Reached from the
 * header avatar so the tab bar stays for the work itself.
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()
  const colors = useThemeColors()

  const profilePath =
    user?.role === "rider" ? "/rider/profile" : "/passenger/profile"
  const settingsPath =
    user?.role === "rider" ? "/rider/settings" : "/passenger/settings"

  const go = (
    path:
      | "/passenger/profile"
      | "/rider/profile"
      | "/passenger/settings"
      | "/rider/settings"
  ) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Account"
        className="size-9 items-center justify-center rounded-full border border-border"
      >
        <Avatar
          initials={initialsOf(user?.name ?? "Fetch")}
          className="size-8"
        />
      </Pressable>

      <HeaderPanel open={open} onClose={() => setOpen(false)} title="Account">
        <View className="flex-row items-center gap-3 pb-4">
          <Avatar initials={initialsOf(user?.name ?? "Fetch")} />
          <View className="min-w-0 flex-1">
            <Text className="font-semibold">{user?.name}</Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        <AccountRow
          icon={<UserIcon size={18} color={colors.foreground} />}
          label="Profile"
          onPress={() => go(profilePath)}
        />
        <AccountRow
          icon={<SettingsIcon size={18} color={colors.foreground} />}
          label="Settings"
          onPress={() => go(settingsPath)}
        />
        <AccountRow
          icon={<LogOut size={18} color={colors.foreground} />}
          label="Sign out"
          onPress={() => {
            setOpen(false)
            logout()
          }}
        />
      </HeaderPanel>
    </>
  )
}

function AccountRow({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode
  label: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 border-t border-border py-3"
    >
      <View className="size-9 items-center justify-center rounded-full bg-secondary">
        {icon}
      </View>
      <Text className="text-sm font-medium">{label}</Text>
    </Pressable>
  )
}
