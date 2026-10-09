import { useEffect, useMemo, useRef, useState } from "react"
import { Car, MapPin, Navigation, RefreshCw, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/PageHeader"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { UserCell } from "@/components/shared/UserCell"
import { MapView } from "./MapView"
import { RIDERS } from "@/data/mock/generate"
import type { Rider, RiderAvailability } from "@/lib/types"
import { formatNumber } from "@/lib/format"

type LiveRider = Rider & { lat: number; lng: number }

const AVAILABILITY_FILTERS: { value: RiderAvailability | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "online", label: "Online" },
  { value: "on_trip", label: "On trip" },
  { value: "offline", label: "Offline" },
]

const AVAILABILITY_COLOR: Record<RiderAvailability, string> = {
  online: "#10b981",
  on_trip: "#f59e0b",
  offline: "#94a3b8",
}

function seedLiveRiders(): LiveRider[] {
  return RIDERS.map((r) => ({ ...r, lat: r.location.lat, lng: r.location.lng }))
}

export default function LiveMapPage() {
  const [riders, setRiders] = useState<LiveRider[]>(() => seedLiveRiders())
  const [filter, setFilter] = useState<RiderAvailability | "all">("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lastSync, setLastSync] = useState(() => new Date())
  const [simulating, setSimulating] = useState(true)
  const tickRef = useRef(0)

  useEffect(() => {
    if (!simulating) return
    const interval = setInterval(() => {
      tickRef.current += 1
      setRiders((prev) =>
        prev.map((r) => {
          if (r.availability === "offline" || r.status !== "active") return r
          const speed = r.availability === "on_trip" ? 0.0035 : 0.0012
          const angle = tickRef.current * 0.7 + r.id.charCodeAt(1)
          return {
            ...r,
            lat: r.lat + Math.cos(angle) * speed + (Math.random() - 0.5) * 0.0006,
            lng: r.lng + Math.sin(angle) * speed + (Math.random() - 0.5) * 0.0006,
          }
        })
      )
      setLastSync(new Date())
    }, 3000)
    return () => clearInterval(interval)
  }, [simulating])

  const filtered = useMemo(
    () => (filter === "all" ? riders : riders.filter((r) => r.availability === filter)),
    [riders, filter]
  )

  const visible = useMemo(() => filtered.filter((r) => r.status === "active"), [filtered])

  const markers = useMemo(
    () =>
      visible.map((r) => ({
        position: [r.lat, r.lng] as [number, number],
        label: r.name,
        color: AVAILABILITY_COLOR[r.availability],
        popup: (
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{r.name}</p>
            <p className="text-xs text-muted-foreground">
              {r.vehicle.model} · {r.vehicle.plateNumber}
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <StatusBadge kind="availability" value={r.availability} />
              <span className="inline-flex items-center gap-0.5 text-xs">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {r.rating.toFixed(1)}
              </span>
            </div>
          </div>
        ),
      })),
    [visible]
  )

  const counts = useMemo(() => {
    const base = riders.filter((r) => r.status === "active")
    return {
      online: base.filter((r) => r.availability === "online").length,
      on_trip: base.filter((r) => r.availability === "on_trip").length,
      offline: riders.filter((r) => r.availability === "offline").length,
      total: riders.length,
    }
  }, [riders])

  const selected = riders.find((r) => r.id === selectedId) ?? null

  const handleReset = () => {
    tickRef.current = 0
    setRiders(seedLiveRiders())
    setLastSync(new Date())
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Rider Map"
        description="Simulated rider telemetry over OpenStreetMap — positions drift every few seconds."
        actions={
          <>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw /> Reset positions
            </Button>
            <Button variant={simulating ? "secondary" : "default"} onClick={() => setSimulating((s) => !s)}>
              {simulating ? "Pause simulation" : "Resume simulation"}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Active riders", value: counts.total, icon: <Car className="size-4" /> },
          { label: "Online", value: counts.online, icon: <Navigation className="size-4" /> },
          { label: "On trip", value: counts.on_trip, icon: <MapPin className="size-4" /> },
          { label: "Offline", value: counts.offline, icon: <RefreshCw className="size-4" /> },
        ].map((item) => (
          <Card key={item.label} className="py-3">
            <CardContent className="flex items-center gap-3 px-4">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {item.icon}
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Metro Manila coverage</CardTitle>
                <CardDescription>
                  Last synced {lastSync.toLocaleTimeString("en-PH")}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABILITY_FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    size="sm"
                    variant={filter === f.value ? "default" : "outline"}
                    onClick={() => setFilter(f.value)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[26rem] sm:h-[32rem]">
              <MapView markers={markers} height="100%" fitKey={`${filter}-${visible.length}`} />
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" /> Online
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" /> On trip
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-slate-400" /> Offline
              </span>
              <span className="ml-auto">{visible.length} riders shown</span>
            </div>
          </CardContent>
        </Card>

        <Card className="flex min-h-0 flex-col">
          <CardHeader className="border-b">
            <CardTitle>Rider list</CardTitle>
            <CardDescription>Click a rider to focus on the map</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[26rem] sm:h-[32rem]">
              <div className="divide-y">
                {filtered.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No riders match this filter.
                  </p>
                )}
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 ${
                      selectedId === r.id ? "bg-muted" : ""
                    }`}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: AVAILABILITY_COLOR[r.availability] }}
                    />
                    <div className="min-w-0 flex-1">
                      <UserCell name={r.name} subtitle={r.vehicle.plateNumber} />
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge
                        variant="outline"
                        className="mb-1 bg-muted text-[10px] text-muted-foreground"
                      >
                        {formatNumber(r.totalTrips)} trips
                      </Badge>
                      <p className="text-[10px] text-muted-foreground">
                        {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected rider</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rider</p>
              <UserCell
                name={selected.name}
                subtitle={`${selected.vehicle.model} · ${selected.vehicle.plateNumber}`}
                size="md"
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="flex gap-1.5">
                <StatusBadge kind="availability" value={selected.availability} />
                <StatusBadge kind="rider" value={selected.status} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Rating / trips</p>
              <p className="text-sm font-medium">
                ⭐ {selected.rating.toFixed(1)} · {formatNumber(selected.totalTrips)} trips
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-sm font-medium">
                {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10">
            <Skeleton className="h-4 w-40" />
            <p className="text-sm text-muted-foreground">No riders match this filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
