import { Check } from "lucide-react"
import { cn } from "cn"

interface StepperProps {
  steps: string[]
  current: number
  onSelect?: (index: number) => void
}

export default function Stepper({ steps, current, onSelect }: StepperProps) {
  return (
    <ol className="flex items-center">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        const clickable = onSelect && i < current
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect(i)}
              className={cn(
                "flex items-center gap-2 rounded-full outline-none disabled:cursor-default",
                clickable && "focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-background text-primary",
                  !done && !active && "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-2 h-px flex-1 sm:mx-3",
                  i < current ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
