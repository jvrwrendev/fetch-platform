import type { ReactNode } from "react"
import { ScrollView, View } from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView, type Edge } from "react-native-safe-area-context"

import { AppHeader } from "@/components/layout/AppHeader"
import { Text } from "@/components/ui/text"

export function Screen({
  children,
  scroll = true,
  header = false,
}: {
  children: ReactNode
  scroll?: boolean
  /** Render the persistent Fetch bar (tab screens). Handles its own top inset. */
  header?: boolean
}) {
  const body = (
    <View className="mx-auto w-full max-w-2xl gap-5 p-4">{children}</View>
  )
  const edges: Edge[] = header ? [] : ["top"]
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-muted/30">
      {header ? <AppHeader /> : null}
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        >
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
