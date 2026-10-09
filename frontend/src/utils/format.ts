export function peso(amount: number): string {
  const rounded = Math.round(amount)
  return `₱${rounded.toLocaleString("en-US")}`
}

export function shortDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function dateTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ")
}
