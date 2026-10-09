import { useMemo, useState } from "react"
import {
  BellRing,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  Info,
  PackageCheck,
  ShieldAlert,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useNotifications } from "./NotificationsContext"
import type { NotificationKind, NotificationSeverity } from "@/lib/types"
import { formatDateTime, relativeTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const SEVERITY_ICON: Record<NotificationSeverity, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: ShieldAlert,
}

const SEVERITY_RING: Record<NotificationSeverity, string> = {
  info: "bg-sky-500/12 text-sky-600 dark:text-sky-400",
  success: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive dark:bg-destructive/20",
}

export default function NotificationsPage() {
  const { notifications, loading, unreadCount, markRead, markAllRead, remove } =
    useNotifications()
  const [filter, setFilter] = useState<"all" | NotificationKind | "unread">("all")

  const filtered = useMemo(() => {
    if (filter === "all") return notifications
    if (filter === "unread") return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.kind === filter)
  }, [notifications, filter])

  const handleMarkAll = async () => {
    await markAllRead()
    toast.success("All notifications marked as read.")
  }

  const handleRemove = async (id: string, title: string) => {
    await remove(id)
    toast.success(`"${title}" dismissed.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="System alerts, booking events, and platform activity in one feed."
        actions={
          <Button variant="outline" onClick={handleMarkAll} disabled={unreadCount === 0}>
            <CheckCheck /> Mark all read
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="booking">Bookings</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <BellRing className="size-9 text-muted-foreground/50" />
            <p className="text-sm font-medium">You're all caught up</p>
            <p className="text-sm text-muted-foreground">No notifications in this category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = SEVERITY_ICON[n.severity]
            return (
              <Card
                key={n.id}
                className={cn("py-3 transition-colors", !n.read && "border-primary/30 bg-primary/[0.03]")}
              >
                <CardContent className="flex items-start gap-3 px-4">
                  <div
                    className={cn(
                      "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                      SEVERITY_RING[n.severity]
                    )}
                  >
                    <Icon className="size-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <StatusBadge kind="severity" value={n.severity} />
                      {n.kind === "booking" ? (
                        <span className="text-[11px] text-muted-foreground">booking event</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">system</span>
                      )}
                      {!n.read && <span className="size-2 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" />
                        {relativeTime(n.createdAt)} · {formatDateTime(n.createdAt)}
                      </span>
                      {n.reference && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                          {n.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead(n.id)}
                        aria-label="Mark as read"
                      >
                        <PackageCheck className="size-4" /> Read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(n.id, n.title)}
                      aria-label="Dismiss notification"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
