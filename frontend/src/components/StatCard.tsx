import { Card, CardContent } from "@/components/ui/card"
import { Text } from "@/components/ui/text"

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string | number
  hint?: string
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="gap-1 p-4 pt-4">
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-2xl font-bold tracking-tight">{value}</Text>
        {hint ? (
          <Text className="text-xs text-muted-foreground">{hint}</Text>
        ) : null}
      </CardContent>
    </Card>
  )
}
