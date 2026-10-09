import { Pressable, View } from "react-native"

import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import type { RideService } from "@/types/service"
import { peso } from "@/utils/format"

export function ServiceCard({
  service,
  selected = false,
  onPress,
}: {
  service: RideService
  selected?: boolean
  onPress?: () => void
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card className={selected ? "border-primary" : undefined}>
        <CardContent className="flex-row items-center gap-4 p-4 pt-4">
          <View className="size-11 items-center justify-center rounded-full bg-secondary">
            <Text className="text-base font-semibold text-secondary-foreground">
              {service.name.charAt(0)}
            </Text>
          </View>
          <View className="min-w-0 flex-1 gap-0.5">
            <Text className="font-semibold">{service.name}</Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {service.description}
            </Text>
            <Text className="text-[11px] text-muted-foreground">
              Up to {service.capacity}{" "}
              {service.capacity === 1 ? "passenger" : "passengers"}
            </Text>
          </View>
          <View className="items-end gap-0.5">
            <Text className="text-sm font-semibold">{peso(service.base)}+</Text>
            <Text className="text-[11px] text-muted-foreground">
              ₱{service.perKm}/km
            </Text>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
}
