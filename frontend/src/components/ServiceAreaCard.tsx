import { Check } from "lucide-react-native"
import { View } from "react-native"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { LIVE_CITIES, PLANNED_MUNICIPALITIES } from "@/shared"
import { useThemeColors } from "@/theme"

/**
 * Where FETCH runs today, stated as two cities rather than twenty-two.
 *
 * The map and the geocoder open across the whole province, but a request from
 * a town with no rider online sits in SEARCHING — so the live cities lead, each
 * with what is actually inside its radius, and the rest of Bukidnon is listed
 * as coming next.
 */
export function ServiceAreaCard() {
  const colors = useThemeColors()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Service area</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <Text className="text-sm text-muted-foreground">
          Riders are on the road in these cities today.
        </Text>

        <View className="gap-3">
          {LIVE_CITIES.map((city) => (
            <View
              key={city.name}
              className="flex-row items-start gap-3 rounded-lg border border-border p-3"
            >
              <View className="mt-0.5 size-5 items-center justify-center rounded-full bg-primary">
                <Check size={12} color={colors.primaryForeground} />
              </View>
              <View className="min-w-0 flex-1 gap-0.5">
                <Text className="text-sm font-semibold">{city.name}</Text>
                <Text className="text-xs text-muted-foreground">
                  {city.area}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {city.blurb}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="gap-2">
          <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Coming next
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {PLANNED_MUNICIPALITIES.map((town) => (
              <View
                key={town}
                className="rounded-full border border-border px-3 py-1"
              >
                <Text className="text-xs text-muted-foreground">{town}</Text>
              </View>
            ))}
          </View>
        </View>
      </CardContent>
    </Card>
  )
}
