import { View } from "react-native"

import { Text } from "@/components/ui/text"
import { cn } from "@/lib/utils"

export function Avatar({
  initials,
  className,
}: {
  initials: string
  className?: string
}) {
  return (
    <View
      className={cn(
        "size-10 items-center justify-center rounded-full bg-secondary",
        className
      )}
    >
      <Text className="text-sm font-medium text-secondary-foreground">
        {initials}
      </Text>
    </View>
  )
}

export function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
