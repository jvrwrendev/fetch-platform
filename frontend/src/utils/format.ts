export function peso(amount: number): string {
  const rounded = Math.round(amount)
  return `₱${rounded.toLocaleString("en-US")}`
}

export function shortDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

/** A compact "how long ago", for the notifications list. */
export function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return shortDate(iso)
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
