import type { ReactNode } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon,
  delta,
  deltaLabel = "vs last period",
}: {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  delta?: number
  deltaLabel?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <Card className="py-4">
      <CardContent className="flex items-start justify-between gap-3 px-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p className="truncate text-2xl font-bold tracking-tight">{value}</p>
          {delta !== undefined ? (
            <p
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                up ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
              )}
            >
              {up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {up ? "+" : ""}
              {delta.toFixed(1)}%{" "}
              <span className="font-normal text-muted-foreground">{deltaLabel}</span>
            </p>
          ) : hint ? (
            <p className="text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {icon && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
