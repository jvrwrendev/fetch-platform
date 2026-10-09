import { ActivityIndicator, View } from "react-native"

export function Loading({ label }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background">
      <ActivityIndicator size="large" color="#171717" />
      {label ? (
        <View accessible accessibilityLabel={label} />
      ) : null}
    </View>
  )
}
