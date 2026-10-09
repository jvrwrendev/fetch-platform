import { Check } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { Text } from "@/components/ui/text"
import { cn } from "@/utils/cn"
import { useThemeColors } from "@/theme"

export default function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: string[]
  current: number
  onSelect?: (index: number) => void
}) {
  const colors = useThemeColors()
  return (
    <View className="flex-row items-center">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        const clickable = Boolean(onSelect) && index < current
        return (
          <Pressable
            key={label}
            disabled={!clickable}
            onPress={() => clickable && onSelect?.(index)}
            className="flex-1 flex-row items-center gap-2"
          >
            <View
              className={cn(
                "size-7 items-center justify-center rounded-full border",
                done || active
                  ? "border-primary bg-primary"
                  : "border-border bg-background"
              )}
            >
              {done ? (
                <Check size={14} color={colors.primaryForeground} />
              ) : (
                <Text
                  className={cn(
                    "text-xs font-medium",
                    active ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              className={cn(
                "text-xs",
                active ? "font-medium text-foreground" : "text-muted-foreground"
              )}
              numberOfLines={1}
            >
              {label}
            </Text>
            {index < steps.length - 1 ? (
              <View className="mx-1 h-px flex-1 bg-border" />
            ) : null}
          </Pressable>
        )
      })}
    </View>
  )
}
