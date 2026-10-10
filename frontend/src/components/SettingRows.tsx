import { ChevronRight, type LucideIcon } from "lucide-react-native"
import { Children, type ReactNode } from "react"
import { Pressable, View } from "react-native"

import { Text } from "@/components/ui/text"
import { useThemeColors } from "@/theme"
import { cn } from "@/utils/cn"

/**
 * One row in an account/settings list: icon, label, optional hint, chevron.
 *
 * No filled chip behind the icon — a column of saturated circles reads as a
 * column of badges competing with each other, and the icon alone already
 * tells the rows apart.
 */
export function SettingRow({
  icon: Icon,
  label,
  hint,
  onPress,
  destructive,
  right,
}: {
  icon: LucideIcon
  label: string
  /** The current value, or a short explanation of what the row does. */
  hint?: string
  onPress?: () => void
  destructive?: boolean
  /** Replaces the chevron with a control, e.g. a Switch. */
  right?: ReactNode
}) {
  const colors = useThemeColors()

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      className="min-h-14 flex-row items-center gap-3 px-4 py-3"
    >
      <Icon
        size={18}
        color={destructive ? colors.destructive : colors.mutedForeground}
      />
      <View className="min-w-0 flex-1">
        <Text
          className={cn(
            "text-[15px] font-medium",
            destructive && "text-destructive"
          )}
          numberOfLines={1}
        >
          {label}
        </Text>
        {hint ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <ChevronRight size={16} color={colors.mutedForeground} />
        ) : null)}
    </Pressable>
  )
}

/** A divided card of rows, optionally under a heading. */
export function SettingGroup({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  const items = Children.toArray(children)

  return (
    <View className="gap-2">
      {title ? (
        <Text className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-2xl border border-border bg-card">
        {items.map((child, index) => (
          <View key={index}>
            {index > 0 ? <View className="h-px bg-border" /> : null}
            {child}
          </View>
        ))}
      </View>
    </View>
  )
}
