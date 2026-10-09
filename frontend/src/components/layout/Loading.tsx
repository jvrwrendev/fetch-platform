import { ActivityIndicator, View } from "react-native"

import { useThemeColors } from "@/theme"

export function Loading({ label }: { label?: string }) {
  const colors = useThemeColors()
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background">
      <ActivityIndicator size="large" color={colors.primary} />
      {label ? (
        <View accessible accessibilityLabel={label} />
      ) : null}
    </View>
  )
}
