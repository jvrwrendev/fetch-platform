import { useCallback, useEffect, useMemo, useState } from "react"
import { BadgeCheck, Ban, Check, ShieldCheck, UserCheck, UserX, X } from "lucide-react"
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
import { useRiders } from "./RidersContext"
import type { Rider, RiderApproval, RiderStatus } from "@/lib/types"
import { formatDate, formatNumber, percent } from "@/lib/format"
import { useDebounce } from "@/hooks/use-debounce"

type SortKey = "name" | "trips" | "rating" | "joined"

type PendingAction =
  | { type: "approval"; rider: Rider; approval: RiderApproval }
  | { type: "status"; rider: Rider; status: RiderStatus }

const VEHICLE_LABEL = "Motorcycle"

export default function RidersPage() {
  const { data, loading, error, fetchRiders, setApproval, setStatus } = useRiders()

  const [search, setSearch] = useState("")
  const [approval, setApprovalFilter] = useState<RiderApproval | "all">("all")
  const [status, setStatusFilter] = useState<RiderStatus | "all">("all")
  const [sort, setSort] = useState<SortKey>("joined")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Rider | null>(null)
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [saving, setSaving] = useState(false)

  const debouncedSearch = useDebounce(search, 300)
  const pageSize = 10

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, approval, status, sort, sortDir])

  useEffect(() => {
    fetchRiders({ search: debouncedSearch, approval, status, sort, sortDir, page, pageSize })
  }, [fetchRiders, debouncedSearch, approval, status, sort, sortDir, page])

  const handleSort = useCallback((key: string, dir: "asc" | "desc") => {
    setSort(key as SortKey)
    setSortDir(dir)
  }, [])

  const columns: DataTableColumn<Rider>[] = useMemo(
    () => [
      {
        key: "rider",
        header: "Rider",
        sortKey: "name",
        cell: (r) => <UserCell name={r.name} subtitle={r.email} id={r.id} />,
      },
      {
        key: "vehicle",
        header: "Vehicle",
        cell: (r) => (
          <div className="text-sm">
            <p className="font-medium">{r.vehicle.model}</p>
            <p className="text-xs text-muted-foreground">
              {r.vehicle.plateNumber} · {VEHICLE_LABEL}
            </p>
          </div>
        ),
      },
      {
        key: "phone",
        header: "Phone",
        hideOnMobile: true,
        className: "whitespace-nowrap",
        cell: (r) => <span className="text-sm text-muted-foreground">{r.phone}</span>,
      },
      {
        key: "trips",
        header: "Trips",
        sortKey: "trips",
        className: "text-right",
        headerClassName: "text-right",
        cell: (r) => <span className="font-medium tabular-nums">{formatNumber(r.totalTrips)}</span>,
      },
      {
        key: "rating",
        header: "Rating",
        sortKey: "rating",
        className: "text-right",
        headerClassName: "text-right",
        cell: (r) => (
          <span className="font-medium tabular-nums">⭐ {r.rating.toFixed(1)}</span>
        ),
      },
      {
        key: "approval",
        header: "Approval",
        cell: (r) => <StatusBadge kind="approval" value={r.approval} />,
      },
      {
        key: "status",
        header: "Status",
        cell: (r) => (
          <div className="flex flex-wrap gap-1">
            <StatusBadge kind="rider" value={r.status} />
            {r.status === "active" && <StatusBadge kind="availability" value={r.availability} />}
          </div>
        ),
      },
      {
        key: "joined",
        header: "Joined",
        sortKey: "joined",
        hideOnMobile: true,
        className: "whitespace-nowrap text-muted-foreground",
        cell: (r) => <span className="text-xs">{formatDate(r.joinedAt)}</span>,
      },
    ],
    []
  )

  const handleConfirm = async () => {
    if (!pending) return
    setSaving(true)
    try {
      if (pending.type === "approval") {
        await setApproval(pending.rider.id, pending.approval)
        toast.success(
          `${pending.rider.name} ${pending.approval === "approved" ? "approved" : "rejected"}.`
        )
      } else {
        await setStatus(pending.rider.id, pending.status)
        toast.success(`${pending.rider.name} marked as ${pending.status}.`)
      }
      setSelected((prev) =>
        prev && prev.id === pending.rider.id
          ? pending.type === "approval"
            ? { ...prev, approval: pending.approval }
            : { ...prev, status: pending.status }
          : prev
      )
      fetchRiders({ search: debouncedSearch, approval, status, sort, sortDir, page, pageSize })
    } catch {
      toast.error("Could not update rider.")
    } finally {
      setSaving(false)
      setPending(null)
    }
  }

  const pendingCount = data?.items.filter((r) => r.approval === "pending").length ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rider Management"
        description="Review applications, verify riders, and control account access."
        actions={
          pendingCount > 0 ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
              <ShieldCheck className="size-4" />
              {pendingCount} pending approval
            </span>
          ) : undefined
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
        getRowId={(r) => r.id}
        total={data?.total ?? 0}
        page={page}
        pageCount={Math.max(1, Math.ceil((data?.total ?? 0) / pageSize))}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search name, plate, phone, ID…"
        sort={sort}
        sortDir={sortDir}
        onSortChange={handleSort}
        onRowClick={(r) => setSelected(r)}
        emptyTitle="No riders found"
        emptyDescription="Adjust the search term or filters to see more riders."
        filters={
          <>
            <Select value={approval} onValueChange={(v) => setApprovalFilter(v as RiderApproval | "all")}>
              <SelectTrigger className="w-36" size="sm">
                <SelectValue placeholder="Approval" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All approvals</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v) => setStatusFilter(v as RiderStatus | "all")}>
              <SelectTrigger className="w-32" size="sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
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
                <DialogTitle>Rider details</DialogTitle>
                <DialogDescription>
                  {selected.id} · license {selected.licenseNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <UserCell name={selected.name} subtitle={selected.email} size="lg" />
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge kind="approval" value={selected.approval} />
                    <StatusBadge kind="rider" value={selected.status} />
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
                    <p className="text-xs text-muted-foreground">Vehicle</p>
                    <p className="font-medium">{selected.vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Plate number</p>
                    <p className="font-medium">{selected.vehicle.plateNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Completed trips</p>
                    <p className="font-medium">{formatNumber(selected.completedTrips)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cancellation rate</p>
                    <p className="font-medium">{percent(selected.cancelRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                    <p className="font-medium">⭐ {selected.rating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">{formatDate(selected.joinedAt)}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2 sm:flex-row">
                  {selected.approval === "pending" && (
                    <>
                      <Button
                        className="flex-1"
                        onClick={() =>
                          setPending({ type: "approval", rider: selected, approval: "approved" })
                        }
                      >
                        <Check /> Approve rider
                      </Button>
                      <Button
                        className="flex-1"
                        variant="destructive"
                        onClick={() =>
                          setPending({ type: "approval", rider: selected, approval: "rejected" })
                        }
                      >
                        <X /> Reject application
                      </Button>
                    </>
                  )}
                  {selected.approval === "approved" && selected.status === "active" && (
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => setPending({ type: "status", rider: selected, status: "inactive" })}
                    >
                      <UserX /> Deactivate
                    </Button>
                  )}
                  {selected.approval === "approved" && selected.status !== "active" && (
                    <Button
                      className="flex-1"
                      onClick={() => setPending({ type: "status", rider: selected, status: "active" })}
                    >
                      <UserCheck /> Reactivate
                    </Button>
                  )}
                  {selected.approval === "approved" && selected.status === "active" && (
                    <Button
                      className="flex-1"
                      variant="destructive"
                      onClick={() => setPending({ type: "status", rider: selected, status: "suspended" })}
                    >
                      <Ban /> Suspend
                    </Button>
                  )}
                  {selected.approval === "rejected" && (
                    <Button
                      className="flex-1"
                      onClick={() =>
                        setPending({ type: "approval", rider: selected, approval: "pending" })
                      }
                    >
                      <BadgeCheck /> Reset to pending
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={
          pending?.type === "approval"
            ? pending.approval === "approved"
              ? "Approve rider?"
              : pending.approval === "rejected"
                ? "Reject application?"
                : "Reset application?"
            : `Mark rider as ${pending?.type === "status" ? pending.status : ""}?`
        }
        description={
          pending
            ? pending.type === "approval"
              ? pending.approval === "approved"
                ? `${pending.rider.name} will be able to accept bookings immediately.`
                : pending.approval === "rejected"
                  ? `${pending.rider.name}'s application will be rejected. They can reapply later.`
                  : `${pending.rider.name}'s application will return to the review queue.`
              : pending.status === "suspended"
                ? `${pending.rider.name} will be suspended and unable to accept trips.`
                : pending.status === "active"
                  ? `${pending.rider.name} will be able to accept trips again.`
                  : `${pending.rider.name} will be deactivated.`
            : ""
        }
        confirmLabel="Confirm"
        destructive={
          (pending?.type === "approval" && pending.approval === "rejected") ||
          (pending?.type === "status" && pending.status !== "active")
        }
        loading={saving}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
