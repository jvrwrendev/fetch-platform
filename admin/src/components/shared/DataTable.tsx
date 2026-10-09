import { useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown, Search, Inbox } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  sortKey?: string
  className?: string
  headerClassName?: string
  hideOnMobile?: boolean
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  total: number
  page: number
  pageCount: number
  pageSize: number
  onPageChange: (page: number) => void
  loading?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  sort?: string
  sortDir?: "asc" | "desc"
  onSortChange?: (key: string, dir: "asc" | "desc") => void
  filters?: ReactNode
  toolbarExtra?: ReactNode
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  rowClassName?: (row: T) => string | undefined
}

function pageWindow(page: number, pageCount: number): (number | "ellipsis")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1)
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1])
  if (page <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (page >= pageCount - 2) [pageCount - 3, pageCount - 2, pageCount - 1].forEach((p) => pages.add(p))
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
  const out: (number | "ellipsis")[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("ellipsis")
    out.push(p)
    prev = p
  }
  return out
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  total,
  page,
  pageCount,
  pageSize,
  onPageChange,
  loading,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  sort,
  sortDir = "desc",
  onSortChange,
  filters,
  toolbarExtra,
  onRowClick,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  rowClassName,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState("")
  const controlledSearch = search !== undefined

  const handleSearch = (value: string) => {
    if (controlledSearch) onSearchChange?.(value)
    else setLocalSearch(value)
  }

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortKey || !onSortChange) return
    const nextDir = sort === column.sortKey && sortDir === "asc" ? "desc" : "asc"
    onSortChange(column.sortKey, nextDir)
  }

  const showSkeleton = loading && rows.length === 0
  const showEmpty = !loading && rows.length === 0
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {onSearchChange !== undefined || !controlledSearch ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={controlledSearch ? search : localSearch}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
              aria-label={searchPlaceholder}
            />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">{filters}</div>
        {toolbarExtra ? <div className="sm:ml-auto">{toolbarExtra}</div> : null}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(column.headerClassName, column.hideOnMobile && "hidden md:table-cell")}
                  >
                    {column.sortKey && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => handleSort(column)}
                        className="inline-flex items-center gap-1 rounded-sm font-medium hover:text-foreground"
                      >
                        {column.header}
                        {sort === column.sortKey ? (
                          sortDir === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : (
                            <ArrowDown className="size-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="size-3.5 opacity-40" />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {showSkeleton
                ? Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      {columns.map((column) => (
                        <TableCell key={column.key}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : rows.map((row) => (
                    <TableRow
                      key={getRowId(row)}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        onRowClick && "cursor-pointer",
                        rowClassName?.(row)
                      )}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.className,
                            column.hideOnMobile && "hidden md:table-cell"
                          )}
                        >
                          {column.cell(row)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {showEmpty && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <Inbox className="size-9 text-muted-foreground/50" />
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{from}</span>–
          <span className="font-medium text-foreground">{to}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span> results
        </p>
        {pageCount > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page > 1) onPageChange(page - 1)
                  }}
                  aria-disabled={page === 1}
                  className={cn(page === 1 && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
              {pageWindow(page, pageCount).map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault()
                        onPageChange(p)
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (page < pageCount) onPageChange(page + 1)
                  }}
                  aria-disabled={page === pageCount}
                  className={cn(page === pageCount && "pointer-events-none opacity-50")}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((__, c) => (
              <Skeleton key={c} className="h-5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
