import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { View, type ViewProps } from "react-native"

import { Text } from "@/components/ui/text"
import { cn } from "@/utils/cn"

const badgeVariants = cva(
  "flex-row items-center rounded-full border px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary",
        secondary: "border-transparent bg-secondary",
        outline: "border-border bg-transparent",
        destructive: "border-transparent bg-destructive",
        success: "border-transparent bg-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const badgeTextVariants: Record<string, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  destructive: "text-destructive-foreground",
  success: "text-success-foreground",
}

export interface BadgeProps
  extends ViewProps,
    VariantProps<typeof badgeVariants> {
  className?: string
  textClassName?: string
  children?: React.ReactNode
}

export function Badge({
  className,
  textClassName,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-xs font-medium",
            badgeTextVariants[variant ?? "default"],
            textClassName
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  )
}
