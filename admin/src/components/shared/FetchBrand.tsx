import { cn } from "@/lib/utils"

/**
 * The FETCH crest beside the wordmark, for the admin console.
 *
 * `public/logo.svg` is the single source for the brand mark; this only sizes
 * it and decides whether the wordmark rides along.
 */
export function FetchBrand({
  className,
  size = "md",
  showWordmark = true,
}: {
  className?: string
  /** Crest size. */
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
}) {
  const badge = { sm: "size-8", md: "size-9", lg: "size-12" }[size]
  const wordmark = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  }[size]

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src="/logo.svg"
        alt=""
        aria-hidden
        className={cn("shrink-0 rounded-lg", badge)}
      />
      {showWordmark ? (
        <span className={cn("font-semibold tracking-tight", wordmark)}>
          Fetch
        </span>
      ) : null}
    </span>
  )
}
