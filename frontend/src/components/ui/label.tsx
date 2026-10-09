import * as React from "react"

import { Text } from "@/components/ui/text"
import { cn } from "@/utils/cn"

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}
