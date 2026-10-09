import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Car,
  MapPinned,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatCard } from "@/components/shared/StatCard"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { UserCell } from "@/components/shared/UserCell"
import { TableSkeleton } from "@/components/shared/DataTable"
import { useBookings } from "@/features/bookings/BookingsContext"
import { useNotifications } from "@/features/notifications/NotificationsContext"
import { bookingService, reportsService, type BookingQuery } from "@/lib/services"
import { compactNumber, formatDateTime, peso } from "@/lib/format"
import type { Booking, DashboardStats } from "@/lib/types"
import { MapView } from "@/features/map/MapView"
import { RIDERS } from "@/data/mock/generate"

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  bookings: {
    label: "Bookings",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<{ date: string; revenue: number; bookings: number }[]>([])
  const [recent, setRecent] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const { data: bookingsPage } = useBookings()
  const { unreadCount } = useNotifications()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      reportsService.dashboardStats(),
      reportsService.revenueSeries(14),
      bookingService.list({ page: 1, pageSize: 5, sort: "newest" } as BookingQuery),
    ]).then(([s, r, b]) => {
      if (cancelled) return
      setStats(s)
      setRevenue(r)
      setRecent(b.items)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const liveRiders = useMemo(
    () => RIDERS.filter((r) => r.availability !== "offline" && r.status === "active"),
    []
  )

  const mapMarkers = useMemo(
    () =>
      liveRiders.map((r) => ({
        position: [r.location.lat, r.location.lng] as [number, number],
        label: r.name,
        color:
          r.availability === "on_trip" ? "#f59e0b" : "#10b981",
      })),
    [liveRiders]
  )

  const recentTotal = recent.reduce((sum, b) => sum + b.fare.total, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Loading platform overview…" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time snapshot of the Fetch ride platform across Bukidnon."
        actions={
          <>
            <Button variant="outline" render={<Link to="/live-map" />}>
              <MapPinned /> Live map
            </Button>
            <Button render={<Link to="/reports" />}>
              View reports <ArrowRight />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total Passengers"
          value={compactNumber(stats.totalPassengers)}
          delta={stats.passengersDelta}
          icon={<UsersRound className="size-5" />}
        />
        <StatCard
          label="Total Riders"
          value={compactNumber(stats.totalRiders)}
          delta={stats.ridersDelta}
          icon={<Car className="size-5" />}
        />
        <StatCard
          label="Total Bookings"
          value={compactNumber(stats.totalBookings)}
          delta={stats.bookingsDelta}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="Active Trips"
          value={compactNumber(stats.activeTrips)}
          delta={stats.activeTripsDelta}
          hint={`${liveRiders.length} riders currently available`}
          icon={<MapPinned className="size-5" />}
        />
        <StatCard
          label="Total Revenue"
          value={peso(stats.totalRevenue)}
          delta={stats.revenueDelta}
          icon={<Wallet className="size-5" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Revenue trend</CardTitle>
                <CardDescription>Daily gross fare vs bookings, last 14 days</CardDescription>
              </div>
              {unreadCount > 0 && (
                <Link
                  to="/notifications"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {unreadCount} unread notifications
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-64 w-full">
              <AreaChart data={revenue} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(v: string) =>
                    new Date(v).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                  }
                  minTickGap={28}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `₱${compactNumber(v)}`}
                  width={56}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
            <ChartLegend content={<ChartLegendContent />} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live rider map</CardTitle>
            <CardDescription>
              {liveRiders.length} riders online or on a trip right now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-44 overflow-hidden rounded-lg border">
              <MapView markers={mapMarkers} height="100%" />
            </div>
            <Button
              variant="outline"
              className="w-full"
              render={<Link to="/live-map" />}
            >
              Open full map <ArrowRight />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Recent bookings</CardTitle>
              <CardDescription>
                Latest 5 trips · {peso(recentTotal)} combined fare
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link to="/bookings" />}>
              View all <ArrowRight className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-medium">Reference</th>
                  <th className="py-2 pr-4 font-medium">Passenger</th>
                  <th className="py-2 pr-4 font-medium">Rider</th>
                  <th className="py-2 pr-4 font-medium">Route</th>
                  <th className="py-2 pr-4 font-medium">Fare</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{b.reference}</td>
                    <td className="py-3 pr-4">
                      <UserCell name={b.passengerName} id={b.passengerId} />
                    </td>
                    <td className="py-3 pr-4">
                      {b.riderName ? (
                        <UserCell name={b.riderName} id={b.riderId} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {b.pickup.name} → {b.dropoff.name}
                    </td>
                    <td className="py-3 pr-4 font-medium">{peso(b.fare.total)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge kind="trip" value={b.status} />
                    </td>
                    <td className="py-3 text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateTime(b.createdAt)}
                    </td>
                  </tr>
                ))}
                {bookingsPage === null && recent.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
