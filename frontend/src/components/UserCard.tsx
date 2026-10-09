import type { ReactNode } from "react"
import { View } from "react-native"

import { Avatar, initialsOf } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"

export function UserCard({
  name,
  subtitle,
  right,
  className,
}: {
  name: string
  subtitle?: string
  right?: ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="flex-row items-center gap-3 p-4 pt-4">
        <Avatar initials={initialsOf(name)} className="size-10" />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-sm font-medium" numberOfLines={1}>
            {name}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {right}
      </CardContent>
    </Card>
  )
}
