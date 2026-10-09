import { Pressable, View } from "react-native"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { useTheme, type ThemePreference } from "@/store/ThemeContext"
import { cn } from "@/utils/cn"

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
]

/** System/light/dark selector shared by the passenger and rider profiles. */
export function AppearanceCard() {
  const { preference, setPreference } = useTheme()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Appearance</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <Text className="text-sm text-muted-foreground">
          Follow the system, or pin the app to light or dark.
        </Text>
        <View className="flex-row gap-2">
          {OPTIONS.map((option) => {
            const active = preference === option.value
            return (
              <Pressable
                key={option.value}
                onPress={() => setPreference(option.value)}
                className={cn(
                  "flex-1 items-center rounded-md border py-2",
                  active
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                )}
              >
                <Text
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-primary-foreground" : "text-foreground"
                  )}
                >
                  {option.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </CardContent>
    </Card>
  )
}
