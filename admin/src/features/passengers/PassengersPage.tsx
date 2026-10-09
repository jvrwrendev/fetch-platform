import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, UserCheck, UserX } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { DataTable, type DataTableColumn } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { UserCell } from "@/components/shared/UserCell"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { usePassengers } from "./PassengersContext"
import type { Passenger, PassengerStatus } from "@/lib/types"
import { formatDate, formatNumber, peso } from "@/lib/format"
import { PH_CITIES } from "@/data/mock/locations"
import { useDebounce } from "@/hooks/use-debounce"

type SortKey = "name" | "trips" | "spend" | "joined"

export default function PassengersPage() {
  const { data, loading, error, fetchPassengers, setStatus } = usePassengers()

  const [search, setSearch] = useState("")
  const [status, setStatusFilter] = useState<PassengerStatus | "all">("all")
  const [city, setCity] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("joined")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Passenger | null>(null)
  const [confirm, setConfirm] = useState<{ passenger: Passenger; next: PassengerStatus } | null>(null)
  const [saving, setSaving] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const pageSize = 10

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status, city, sort, sortDir])

  useEffect(() => {
    fetchPassengers({
      search: debouncedSearch,
      status,
      city,
      sort,
      sortDir,
      page,
      pageSize,
    })
  }, [fetchPassengers, debouncedSearch, status, city, sort, sortDir, page])

  const handleSort = useCallback((key: string, dir: "asc" | "desc") => {
    setSort(key as SortKey)
    setSortDir(dir)
  }, [])

  const columns: DataTableColumn<Passenger>[] = useMemo(
    () => [
      {
        key: "passenger",
        header: "Passenger",
        sortKey: "name",
        cell: (p) => <UserCell name={p.name} subtitle={p.email} id={p.id} />,
      },
      {
        key: "phone",
        header: "Phone",
        className: "whitespace-nowrap",
        cell: (p) => <span className="text-sm text-muted-foreground">{p.phone}</span>,
      },
      {
        key: "city",
        header: "City",
        hideOnMobile: true,
        cell: (p) => <span className="text-sm text-muted-foreground">{p.city}</span>,
      },
      {
        key: "trips",
        header: "Trips",
        sortKey: "trips",
        className: "text-right",
        headerClassName: "text-right",
        cell: (p) => (
          <span className="font-medium tabular-nums">{formatNumber(p.totalTrips)}</span>
        ),
      },
      {
        key: "spend",
        header: "Total spend",
        sortKey: "spend",
        className: "text-right",
        headerClassName: "text-right",
        cell: (p) => (
          <span className="font-medium tabular-nums">{peso(p.totalSpend)}</span>
        ),
      },
      {
        key: "joined",
        header: "Joined",
        sortKey: "joined",
        hideOnMobile: true,
        className: "whitespace-nowrap text-muted-foreground",
        cell: (p) => <span className="text-xs">{formatDate(p.joinedAt)}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: (p) => <StatusBadge kind="passenger" value={p.status} />,
      },
    ],
    []
  )

  const handleConfirm = async () => {
    if (!confirm) return
    setSaving(true)
    try {
      await setStatus(confirm.passenger.id, confirm.next)
      toast.success(
        `${confirm.passenger.name} is now ${confirm.next === "active" ? "active" : "inactive"}.`
      )
      setSelected((prev) =>
        prev && prev.id === confirm.passenger.id ? { ...prev, status: confirm.next } : prev
      )
      fetchPassengers({ search: debouncedSearch, status, city, sort, sortDir, page, pageSize })
    } catch {
      toast.error("Could not update passenger status.")
    } finally {
      setSaving(false)
      setConfirm(null)
    }
  }

  const exportCsv = () => {
    if (!data) return
    const header = ["ID", "Name", "Email", "Phone", "City", "Trips", "Spend", "Status", "Joined"]
    const rows = data.items.map((p) =>
      [p.id, p.name, p.email, p.phone, p.city, p.totalTrips, p.totalSpend, p.status, p.joinedAt]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(",")
    )
    const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "passengers.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Passenger CSV exported.")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Passenger Management"
        description="Search, review, and manage passenger accounts on the platform."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!data || data.items.length === 0}>
            <Download /> Export CSV
          </Button>
        }
      />

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(p) => p.id}
        total={data?.total ?? 0}
        page={page}
        pageCount={Math.max(1, Math.ceil((data?.total ?? 0) / pageSize))}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, email, phone, ID…"
        sort={sort}
        sortDir={sortDir}
        onSortChange={handleSort}
        onRowClick={(p) => setSelected(p)}
        emptyTitle="No passengers found"
        emptyDescription="Adjust the search term or filters to see more passengers."
        filters={
          <>
            <Select
              value={status}
              onValueChange={(v) => setStatusFilter(v as PassengerStatus | "all")}
            >
              <SelectTrigger className="w-36" size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={(v) => setCity(v ?? "all")}>
              <SelectTrigger className="w-40" size="sm">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {PH_CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Passenger details</DialogTitle>
                <DialogDescription>
                  {selected.id} · joined {formatDate(selected.joinedAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <UserCell
                    name={selected.name}
                    subtitle={selected.email}
                    size="lg"
                  />
                  <div className="ml-auto">
                    <StatusBadge kind="passenger" value={selected.status} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{selected.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="font-medium">{selected.city}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total trips</p>
                    <p className="font-medium">{formatNumber(selected.totalTrips)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lifetime spend</p>
                    <p className="font-medium">{peso(selected.totalSpend)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-medium">⭐ {selected.rating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last active</p>
                    <p className="font-medium">{formatDate(selected.lastActiveAt)}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex flex-col gap-2 sm:flex-row">
                  {selected.status === "active" ? (
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setConfirm({ passenger: selected, next: "inactive" })}
                    >
                      <UserX /> Deactivate account
                    </Button>
                  ) : (
                    <Button
                      className="flex-1"
                      onClick={() => setConfirm({ passenger: selected, next: "active" })}
                    >
                      <UserCheck /> Activate account
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm?.next === "active"
            ? "Activate passenger?"
            : "Deactivate passenger?"
        }
        description={
          confirm?.next === "active"
            ? `${confirm?.passenger.name} will be able to book rides again.`
            : `${confirm?.passenger.name} will no longer be able to book rides. Existing trips are unaffected.`
        }
        confirmLabel={confirm?.next === "active" ? "Activate" : "Deactivate"}
        destructive={confirm?.next === "inactive"}
        loading={saving}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
