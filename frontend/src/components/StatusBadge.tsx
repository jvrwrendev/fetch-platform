import { Badge } from "@/components/ui/badge"
import type { TripStatus } from "@/shared"
import { statusLabel } from "@/utils/format"

export type StatusVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "success"

const TRIP_VARIANT: Record<TripStatus, StatusVariant> = {
  searching: "secondary",
  accepted: "default",
  arriving: "default",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
}

/**
 * Renders a domain status string as a `Badge`. Pass an explicit `variant` for
 * non-trip statuses (rider approval, availability, …).
 */
export function StatusBadge({
  status,
  variant,
  className,
}: {
  status: string
  variant?: StatusVariant
  className?: string
}) {
  const resolved = variant ?? TRIP_VARIANT[status as TripStatus] ?? "secondary"
  return (
    <Badge variant={resolved} className={className}>
      {statusLabel(status)}
    </Badge>
  )
}
