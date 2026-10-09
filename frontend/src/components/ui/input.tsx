import * as React from "react"
import { TextInput, type TextInputProps } from "react-native"

import { cn } from "@/lib/utils"

export const Input = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  TextInputProps & { className?: string }
>(({ className, ...props }, ref) => (
  <TextInput
    ref={ref}
    placeholderTextColor="#737373"
    className={cn(
      "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground",
      className
    )}
    {...props}
  />
))
Input.displayName = "Input"
