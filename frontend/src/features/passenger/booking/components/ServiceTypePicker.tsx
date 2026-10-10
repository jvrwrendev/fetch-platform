import { Pressable, View } from "react-native"

import { ServiceIcon } from "@/components/ServiceIcon"
import { Text } from "@/components/ui/text"
import {
  BOOKING_TYPES,
  serviceLabel,
  type BookingType,
} from "@/shared"
import { useThemeColors } from "@/theme"
import { cn } from "@/utils/cn"

const LABELS: Record<BookingType, string> = {
  ride: "Book ride",
  pabili: "Pabili",
  padala: serviceLabel("padala", "commuter"),
}

/** The three services a passenger can book, as one compact chooser. */
export function ServiceTypePicker({
  value,
  onChange,
}: {
  value: BookingType
  onChange: (next: BookingType) => void
}) {
  const colors = useThemeColors()

  return (
    <View className="flex-row gap-2">
      {BOOKING_TYPES.map((type) => {
        const active = type === value
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            className={cn(
              "flex-1 items-center gap-1 rounded-lg border p-3",
              active ? "border-primary bg-primary" : "border-border bg-card"
            )}
          >
            <ServiceIcon
              type={type}
              size={20}
              color={active ? colors.primaryForeground : colors.foreground}
            />
            <Text
              className={cn(
                "text-xs font-medium",
                active ? "text-primary-foreground" : "text-foreground"
              )}
            >
              {LABELS[type]}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}
