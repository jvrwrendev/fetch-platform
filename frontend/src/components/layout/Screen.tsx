import type { ReactNode } from "react"
import { ScrollView, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"

import { Text } from "@/components/ui/text"

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode
  scroll?: boolean
}) {
  const body = (
    <View className="mx-auto w-full max-w-2xl gap-5 p-4">{children}</View>
  )
  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-muted/30">
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="flex-row items-start justify-between gap-3"
    >
      <View className="flex-1 gap-1">
        <Text className="text-2xl font-bold tracking-tight">{title}</Text>
        {description ? (
          <Text className="text-sm text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      {action}
    </Animated.View>
  )
}
