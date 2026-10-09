import * as React from "react"
import { Switch as RNSwitch, type SwitchProps } from "react-native"

import { useThemeColors } from "@/theme"

export const Switch = React.forwardRef<
  React.ComponentRef<typeof RNSwitch>,
  SwitchProps
>((props, ref) => {
  const colors = useThemeColors()
  return (
    <RNSwitch
      ref={ref}
      trackColor={{ false: colors.input, true: colors.primary }}
      thumbColor={colors.background}
      ios_backgroundColor={colors.input}
      {...props}
    />
  )
})
Switch.displayName = "Switch"
