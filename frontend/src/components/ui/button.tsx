import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native"

import { cn } from "@/utils/cn"
import { useThemeColors } from "@/theme"

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-border bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const labelVariants: Record<string, string> = {
  default: "text-primary-foreground",
  destructive: "text-destructive-foreground",
  outline: "text-foreground",
  secondary: "text-secondary-foreground",
  ghost: "text-foreground",
  link: "text-foreground underline",
}

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string
  textClassName?: string
  loading?: boolean
  children?: React.ReactNode
}

export const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  (
    {
      className,
      textClassName,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const tone = labelVariants[variant ?? "default"] ?? labelVariants.default
    const colors = useThemeColors()
    const spinnerColor =
      variant === "default"
        ? colors.primaryForeground
        : variant === "destructive"
          ? colors.destructiveForeground
          : colors.foreground
    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          buttonVariants({ variant, size }),
          (disabled || loading) && "opacity-50",
          className
        )}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : null}
        {typeof children === "string" ? (
          <Text className={cn("text-sm font-medium", tone, textClassName)}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    )
  }
)
Button.displayName = "Button"

export { buttonVariants }
