import * as React from "react"
import { Switch as RNSwitch, type SwitchProps } from "react-native"

export const Switch = React.forwardRef<
  React.ComponentRef<typeof RNSwitch>,
  SwitchProps
>((props, ref) => (
  <RNSwitch
    ref={ref}
    trackColor={{ false: "#e5e5e5", true: "#171717" }}
    thumbColor="#ffffff"
    ios_backgroundColor="#e5e5e5"
    {...props}
  />
))
Switch.displayName = "Switch"
