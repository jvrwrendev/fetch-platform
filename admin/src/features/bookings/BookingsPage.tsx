import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowRight, Calendar, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/PageHeader"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { UserCell } from "@/components/shared/UserCell"
import { useBookings } from "./BookingsContext"
import type { Booking, BookingType, TripStatus } from "@/lib/types"
import { formatDateTime, peso, pesoPrecise } from "@/lib/format"
import { useDebounce } from "@/hooks/use-debounce"

type SortKey = "newest" | "oldest" | "fare"

const TRIP_STATUS_OPTIONS: TripStatus[] = [
  "searching",
  "accepted",
  "arriving",
  "in_progress",
  "completed",
  "cancelled",
]

const SERVICE_LABEL: Record<BookingType, string> = {
  ride: "Ride",
  pabili: "Pabili",
  padala: "Pasugo",
}

const PAYMENT_LABEL: Record<Booking["paymentMethod"], string> = {
  cash: "Cash",
  ewallet: "E-Wallet",
}

const SERVICE_OPTIONS: BookingType[] = ["ride", "pabili", "padala"]

export default function BookingsPage() {
  const { data, loading, error, fetchBookings } = useBookings()

  const [search, setSearch] = useState("")
  const [status, setStatusFilter] = useState<TripStatus | "all">("all")
  const [service, setService] = useState<BookingType | "all">("all")
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [sort, setSort] = useState<SortKey>("newest")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Booking | null>(null)

  const debouncedSearch = useDebounce(search, 300)
  const pageSize = 10
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, service, fromDate, toDate, sort, sortDir])

  useEffect(() => {
    fetchBookings({
      search: debouncedSearch,
      status,
      service,
      from: fromDate?.toISOString(),
      to: toDate ? new Date(toDate.getTime() + 86_399_999).toISOString() : undefined,
      sort,
      sortDir,
      page,
      pageSize,
    })
  }, [
    fetchBookings,
    debouncedSearch,
    status,
    service,
    fromDate,
    toDate,
    sort,
    sortDir,
    page,
  ])

  const handleSort = useCallback((key: string, dir: "asc" | "desc") => {
    const map: Record<string, SortKey> = { newest: "newest", oldest: "oldest", fare: "fare" }
    setSort(map[key] ?? "newest")
    setSortDir(dir)
  }, [])

  const columns: DataTableColumn<Booking>[] = useMemo(
    () => [
      {
        key: "reference",
        header: "Reference",
        sortKey: "newest",
        cell: (b) => (
          <div>
            <p className="font-medium">{b.reference}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(b.createdAt)}</p>
          </div>
        ),
      },
      {
        key: "passenger",
        header: "Passenger",
        cell: (b) => <UserCell name={b.passengerName} id={b.passengerId} />,
      },
      {
        key: "rider",
        header: "Rider",
        cell: (b) =>
          b.riderName ? (
            <UserCell name={b.riderName} id={b.riderId} />
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          ),
      },
      {
        key: "route",
        header: "Route",
        hideOnMobile: true,
        cell: (b) => (
          <div className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="max-w-32 truncate">{b.pickup.name}</span>
            <ArrowRight className="size-3.5 shrink-0" />
            <span className="max-w-32 truncate">{b.dropoff.name}</span>
          </div>
        ),
      },
      {
        key: "fare",
        header: "Fare",
        sortKey: "fare",
        className: "text-right",
        headerClassName: "text-right",
        cell: (b) => (
          <div className="text-right">
            <p className="font-medium tabular-nums">{peso(b.fare.total)}</p>
            <p className="text-xs text-muted-foreground">
              {b.distanceKm.toFixed(1)} km · {SERVICE_LABEL[b.bookingType ?? "ride"]}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (b) => <StatusBadge kind="trip" value={b.status} />,
      },
    ],
    []
  )

  const activeFilters = [
    status !== "all",
    service !== "all",
    !!fromDate,
    !!toDate,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Booking Management"
        description="Inspect every trip — passenger, rider, route, fare, and status."
      />

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(b) => b.id}
        total={data?.total ?? 0}
        page={page}
        pageCount={Math.max(1, Math.ceil((data?.total ?? 0) / pageSize))}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search reference, passenger, rider, place…"
        sort={sort}
        sortDir={sortDir}
        onSortChange={handleSort}
        onRowClick={(b) => setSelected(b)}
        emptyTitle="No bookings found"
        emptyDescription="Adjust the search term, status, or date filters."
        filters={
          <>
            <Select value={status} onValueChange={(v) => setStatusFilter(v as TripStatus | "all")}>
              <SelectTrigger className="w-36" size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {TRIP_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "in_progress"
                      ? "In Progress"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={service} onValueChange={(v) => setService(v as BookingType | "all")}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {SERVICE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {SERVICE_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="size-4" />
                    {fromDate
                      ? fromDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                      : "From"}
                  </Button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={fromDate}
                  onSelect={setFromDate}
                  autoFocus
                />
                {fromDate && (
                  <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setFromDate(undefined)}>
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="size-4" />
                    {toDate
                      ? toDate.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                      : "To"}
                  </Button>
                }
              />
              <PopoverContent align="start" className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={toDate}
                  onSelect={setToDate}
                  autoFocus
                />
                {toDate && (
                  <div className="border-t p-2">
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setToDate(undefined)}>
                      Clear
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {activeFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setService("all")
                  setFromDate(undefined)
                  setToDate(undefined)
                }}
              >
                Clear filters ({activeFilters})
              </Button>
            )}
          </>
        }
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  Booking {selected.reference}
                  <StatusBadge kind="trip" value={selected.status} />
                </DialogTitle>
                <DialogDescription>{formatDateTime(selected.createdAt)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">PASSENGER</p>
                    <UserCell name={selected.passengerName} id={selected.passengerId} />
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">RIDER</p>
                    {selected.riderName ? (
                      <UserCell name={selected.riderName} id={selected.riderId} />
                    ) : (
                      <p className="text-sm text-muted-foreground">Not yet assigned</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">TRIP ROUTE</p>
                  <div className="relative space-y-3 pl-6">
                    <span className="absolute top-1.5 left-1.5 size-2.5 rounded-full bg-emerald-500" />
                    <span className="absolute top-1.5 left-1.5 h-10 w-px bg-border" />
                    <span className="absolute bottom-2.5 left-1.5 size-2.5 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">{selected.pickup.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.pickup.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selected.dropoff.name}</p>
                      <p className="text-xs text-muted-foreground">{selected.dropoff.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Navigation className="size-3.5" />
                      {selected.distanceKm.toFixed(1)} km
                    </span>
                    <span>{SERVICE_LABEL[selected.bookingType ?? "ride"]}</span>
                    <span>{PAYMENT_LABEL[selected.paymentMethod]}</span>
                    {selected.completedAt && <span>Ended {formatDateTime(selected.completedAt)}</span>}
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs font-medium text-muted-foreground">FARE BREAKDOWN</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base fare</span>
                      <span className="tabular-nums">{pesoPrecise(selected.fare.base)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Distance ({selected.distanceKm.toFixed(1)} km)
                      </span>
                      <span className="tabular-nums">{pesoPrecise(selected.fare.distance)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{pesoPrecise(selected.fare.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
