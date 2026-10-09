import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initialsOf } from "@/lib/format"

export function UserCell({
  name,
  subtitle,
  id,
  size = "sm",
}: {
  name: string
  subtitle?: string
  id?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClass =
    size === "lg" ? "size-11 text-sm" : size === "md" ? "size-9 text-xs" : "size-8 text-xs"
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className={sizeClass}>
        <AvatarFallback className="bg-primary/10 font-semibold text-primary">
          {initialsOf(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle ?? id}</p>
      </div>
    </div>
  )
}
