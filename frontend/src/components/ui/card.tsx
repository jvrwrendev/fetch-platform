import * as React from "react"
import { View, type ViewProps } from "react-native"

import { Text } from "@/components/ui/text"
import { cn } from "@/utils/cn"

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("rounded-xl border border-border bg-card", className)}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: ViewProps & { className?: string }) {
  return <View className={cn("gap-1.5 p-5", className)} {...props} />
}

export function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: ViewProps & { className?: string }) {
  return <View className={cn("gap-4 p-5 pt-0", className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={cn("flex-row items-center gap-2 p-5 pt-0", className)}
      {...props}
    />
  )
}
