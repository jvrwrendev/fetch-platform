import { useEffect, useMemo, useState } from "react"
import { Download, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { reportsService } from "@/lib/services"
import type { BookingType, ReportsSummary, TripStatus } from "@/lib/types"
import { compactNumber, formatNumber, peso } from "@/lib/format"

type Range = 7 | 30 | 90

const revenueConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig

const serviceConfig = {
  ride: { label: "Ride", color: "var(--chart-1)" },
  pabili: { label: "Pabili", color: "var(--chart-2)" },
  padala: { label: "Pasugo", color: "var(--chart-3)" },
} satisfies ChartConfig

const growthConfig = {
  passengers: { label: "Passengers", color: "var(--chart-2)" },
} satisfies ChartConfig

const STATUS_COLORS: Record<TripStatus, string> = {
  completed: "#10b981",
  cancelled: "#ef4444",
  in_progress: "#3b82f6",
  arriving: "#06b6d4",
  accepted: "#8b5cf6",
  searching: "#f59e0b",
}

const SERVICE_LABEL: Record<BookingType, string> = {
  ride: "Ride",
  pabili: "Pabili",
  padala: "Pasugo",
}

export default function ReportsPage() {
  const [range, setRange] = useState<Range>(30)
  const [data, setData] = useState<ReportsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    reportsService.reports(range).then((result) => {
      if (cancelled) return
      setData(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [range])

  const statusPie = useMemo(
    () =>
      data?.bookingsByStatus.map((s) => ({
        name:
          s.status === "in_progress"
            ? "In Progress"
            : s.status.charAt(0).toUpperCase() + s.status.slice(1),
        value: s.count,
        fill: STATUS_COLORS[s.status],
      })) ?? [],
    [data]
  )

  const exportCsv = () => {
    if (!data) return
    const lines = ["date,revenue,bookings"]
    for (const p of data.revenueByDay) lines.push(`${p.date},${p.revenue},${p.bookings}`)
    const blob = new Blob([lines.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `fetch-report-${range}d.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Report CSV exported.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Booking, rider, passenger, and revenue statistics for the selected period."
        actions={
          <>
            <Tabs value={String(range)} onValueChange={(v) => setRange(Number(v) as Range)}>
              <TabsList>
                <TabsTrigger value="7">7 days</TabsTrigger>
                <TabsTrigger value="30">30 days</TabsTrigger>
                <TabsTrigger value="90">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={exportCsv} disabled={!data}>
              {loading ? <Loader2 className="animate-spin" /> : <Download />} Export CSV
            </Button>
          </>
        }
      />

      {loading || !data ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Bookings"
              value={formatNumber(data.kpis.totalBookings)}
              hint={`Last ${range} days`}
            />
            <StatCard label="Gross revenue" value={peso(data.kpis.totalRevenue)} hint={`Last ${range} days`} />
            <StatCard label="Avg fare" value={peso(data.kpis.avgFare)} hint="Per completed trip" />
            <StatCard
              label="Completion rate"
              value={`${data.kpis.completionRate}%`}
              hint={`Cancel rate ${data.kpis.cancelRate}%`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue over time</CardTitle>
                <CardDescription>Daily gross fare across the last {range} days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={revenueConfig} className="h-72 w-full">
                  <LineChart data={data.revenueByDay} margin={{ left: -14, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(v: string) =>
                        new Date(v).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `₱${compactNumber(v)}`}
                      width={54}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      dataKey="revenue"
                      type="monotone"
                      stroke="var(--color-revenue)"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking status mix</CardTitle>
                <CardDescription>Distribution of trips by status</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}} className="h-56 w-full">
                  <PieChart>
                    <Pie
                      data={statusPie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {statusPie.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5 text-xs">
                  {statusPie.map((entry) => (
                    <span key={entry.name} className="inline-flex items-center gap-1.5">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: entry.fill }}
                      />
                      {entry.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by service</CardTitle>
                <CardDescription>Completed fare split per service</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={serviceConfig} className="h-64 w-full">
                  <BarChart
                    data={data.bookingsByService.map((v) => ({
                      ...v,
                      label: SERVICE_LABEL[v.type],
                    }))}
                    margin={{ left: -14, right: 8, top: 8 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `₱${compactNumber(v)}`}
                      width={54}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                      {data.bookingsByService.map((entry) => (
                        <Cell key={entry.type} fill={`var(--color-${entry.type})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Passenger growth</CardTitle>
                <CardDescription>Cumulative registrations by month</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={growthConfig} className="h-64 w-full">
                  <BarChart
                    data={data.passengerGrowth}
                    margin={{ left: -18, right: 8, top: 8 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => compactNumber(v)}
                      width={44}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="passengers"
                      fill="var(--color-passengers)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top routes</CardTitle>
                <CardDescription>Most travelled pickup → destination pairs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topRoutes.map((route, i) => (
                    <div key={route.route} className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{route.route}</p>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.round((route.count / Math.max(data.topRoutes[0]!.count, 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">{peso(route.revenue)}</p>
                        <p>{route.count} trips</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top performing riders</CardTitle>
                <CardDescription>Ranked by revenue generated this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topRiders.map((rider, i) => (
                    <div key={rider.id} className="flex items-center gap-3">
                      <span className="w-5 shrink-0 text-sm font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{rider.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {rider.trips} trips · ⭐ {rider.rating.toFixed(1)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium tabular-nums">{peso(rider.revenue)}</p>
                      </div>
                    </div>
                  ))}
                  {data.topRiders.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No rider activity in this period.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Active riders" value={formatNumber(data.kpis.activeRiders)} hint="Approved & active" />
            <StatCard label="New passengers" value={formatNumber(data.kpis.newPassengers)} hint={`Last ${range} days`} />
            <StatCard label="Cancel rate" value={`${data.kpis.cancelRate}%`} hint="Cancelled / total" />
            <StatCard label="Avg rider rating" value={data.kpis.avgRating.toFixed(1)} hint="Across all riders" />
          </div>
        </>
      )}
    </div>
  )
}
