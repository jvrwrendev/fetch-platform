const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 0,
})

const pesoPreciseFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function peso(amount: number): string {
  return pesoFormatter.format(amount)
}

export function pesoPrecise(amount: number): string {
  return pesoPreciseFormatter.format(amount)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-PH").format(value)
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat("en-PH", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function relativeTime(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime()
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour

  if (abs < minute) return rtf.format(-Math.round(diff / 1000), "second")
  if (abs < hour) return rtf.format(-Math.round(diff / minute), "minute")
  if (abs < day) return rtf.format(-Math.round(diff / hour), "hour")
  if (abs < 30 * day) return rtf.format(-Math.round(diff / day), "day")
  return rtf.format(-Math.round(diff / (30 * day)), "month")
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("")
}

export function percent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}
