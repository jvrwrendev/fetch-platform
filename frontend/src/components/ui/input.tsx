import * as React from "react"
import { TextInput, type TextInputProps } from "react-native"

import { cn } from "@/utils/cn"
import { useThemeColors } from "@/theme"

export const Input = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  TextInputProps & { className?: string }
>(({ className, ...props }, ref) => {
  const colors = useThemeColors()
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={colors.mutedForeground}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground",
        className
      )}
      {...props}
    />
  )
})
Input.displayName = "Input"
