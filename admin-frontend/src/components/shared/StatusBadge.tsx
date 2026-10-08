import type { TripStatus, RiderApproval, RiderStatus, PassengerStatus, RiderAvailability, NotificationSeverity } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info" | "muted"

const toneClass: Record<Tone, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  outline: "border-border text-foreground bg-transparent",
  destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  info: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  muted: "bg-muted text-muted-foreground",
}

const TRIP_META: Record<TripStatus, { label: string; tone: Tone }> = {
  searching: { label: "Searching", tone: "warning" },
  accepted: { label: "Accepted", tone: "info" },
  arriving: { label: "Arriving", tone: "info" },
  in_progress: { label: "In Progress", tone: "default" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "destructive" },
}

const APPROVAL_META: Record<RiderApproval, { label: string; tone: Tone }> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "destructive" },
}

const RIDER_STATUS_META: Record<RiderStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "muted" },
  suspended: { label: "Suspended", tone: "destructive" },
}

const PASSENGER_STATUS_META: Record<PassengerStatus, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  inactive: { label: "Inactive", tone: "muted" },
}

const AVAILABILITY_META: Record<RiderAvailability, { label: string; tone: Tone }> = {
  online: { label: "Online", tone: "success" },
  offline: { label: "Offline", tone: "muted" },
  on_trip: { label: "On Trip", tone: "info" },
}

const SEVERITY_META: Record<NotificationSeverity, { label: string; tone: Tone }> = {
  info: { label: "Info", tone: "info" },
  success: { label: "Success", tone: "success" },
  warning: { label: "Warning", tone: "warning" },
  danger: { label: "Alert", tone: "destructive" },
}

export function StatusBadge({
  kind,
  value,
  className,
}: {
  kind: "trip" | "approval" | "rider" | "passenger" | "availability" | "severity"
  value: string
  className?: string
}) {
  let meta: { label: string; tone: Tone }
  switch (kind) {
    case "trip":
      meta = TRIP_META[value as TripStatus] ?? { label: value, tone: "outline" }
      break
    case "approval":
      meta = APPROVAL_META[value as RiderApproval] ?? { label: value, tone: "outline" }
      break
    case "rider":
      meta = RIDER_STATUS_META[value as RiderStatus] ?? { label: value, tone: "outline" }
      break
    case "passenger":
      meta = PASSENGER_STATUS_META[value as PassengerStatus] ?? { label: value, tone: "outline" }
      break
    case "availability":
      meta = AVAILABILITY_META[value as RiderAvailability] ?? { label: value, tone: "outline" }
      break
    case "severity":
      meta = SEVERITY_META[value as NotificationSeverity] ?? { label: value, tone: "outline" }
      break
    default:
      meta = { label: value, tone: "outline" }
  }

  return (
    <Badge variant="outline" className={cn(toneClass[meta.tone], className)}>
      {meta.label}
    </Badge>
  )
}
