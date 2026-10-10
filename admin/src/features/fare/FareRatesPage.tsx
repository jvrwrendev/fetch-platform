import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  Banknote,
  Bike,
  CircleAlert,
  Loader2,
  MapPin,
  Percent,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { fareService } from "@/lib/services"
import { distanceKm, quoteFare } from "@/lib/fare"
import { peso, pesoPrecise } from "@/lib/format"
import type { FareConfig } from "@/lib/types"
import { LOCATIONS } from "@fetch/shared"
import { SURGE_MAX, SURGE_MIN, SURGE_STEP } from "@fetch/shared"

/** The one vehicle class, with a sample trip for the rate card. */
const VEHICLE = { label: "Motorcycle", icon: Bike, sampleKm: 5, sampleNote: "Typical city hop" }

const SURGE_LABEL = (value: number) =>
  value <= 1
    ? "Standard (1.0×)"
    : value < 1.5
      ? `Low demand (${value.toFixed(1)}×)`
      : value < 2.2
        ? `Peak (${value.toFixed(1)}×)`
        : `High surge (${value.toFixed(1)}×)`

function parseNum(value: string): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  hint,
  prefix,
}: {
  id: string
  label: string
  value: number
  onChange: (n: number) => void
  min?: number
  hint?: string
  prefix?: string
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          min={min}
          step="1"
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(parseNum(e.target.value))}
          className={prefix ? "pl-6" : undefined}
        />
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function FareRatesPage() {
  const [saved, setSaved] = useState<FareConfig | null>(null)
  const [draft, setDraft] = useState<FareConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)

  const [pickupIdx, setPickupIdx] = useState<string>("0")
  const [dropoffIdx, setDropoffIdx] = useState<string>("6")

  useEffect(() => {
    fareService.getRates().then((config) => {
      setSaved(config)
      setDraft(config)
      setLoading(false)
    })
  }, [])

  const dirty = useMemo(
    () => !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  )

  const invalid = useMemo(() => {
    if (!draft) return false
    return (
      draft.base < 0 ||
      draft.perKm < 0 ||
      !Number.isFinite(draft.base) ||
      !Number.isFinite(draft.perKm) ||
      draft.bookingFee < 0 ||
      draft.minFare < 0 ||
      draft.surgeMultiplier < SURGE_MIN ||
      draft.surgeMultiplier > SURGE_MAX
    )
  }, [draft])

  const quote = useMemo(() => {
    if (!draft) return null
    const pickup = LOCATIONS[Number(pickupIdx)]!
    const dropoff = LOCATIONS[Number(dropoffIdx)]!
    const km = distanceKm(pickup, dropoff)
    return { pickup, dropoff, km, result: quoteFare(draft, km) }
  }, [draft, pickupIdx, dropoffIdx])

  const patch = (p: Partial<FareConfig>) =>
    setDraft((prev) => (prev ? { ...prev, ...p } : prev))

  const handleSave = async () => {
    if (!draft) return
    setBusy(true)
    try {
      const next = await fareService.updateRates(draft)
      setSaved(next)
      setDraft(next)
      toast.success("Fare rates saved. New bookings will use these rates.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save fare rates.")
    } finally {
      setBusy(false)
    }
  }

  const handleReset = async () => {
    setResetting(true)
    try {
      const next = await fareService.resetRates()
      setSaved(next)
      setDraft(next)
      toast.success("Fare rates restored to defaults.")
    } finally {
      setResetting(false)
    }
  }

  if (loading || !draft) {
    return (
      <div className="space-y-6">
        <PageHeader title="Fare Rates" description="Loading rate card…" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-lg border bg-card lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-lg border bg-card" />
        </div>
      </div>
    )
  }

  const Icon = VEHICLE.icon
  const sample = quoteFare(draft, VEHICLE.sampleKm)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fare Rates"
        description="Manage the platform rate card — base fare, per-km rate, fees, and surge."
        actions={
          <>
            {dirty && (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Unsaved changes
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset} disabled={busy || resetting}>
              {resetting ? <Loader2 className="animate-spin" /> : <RotateCcw />} Reset defaults
            </Button>
            <Button onClick={handleSave} disabled={!dirty || invalid || busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Save />} Save rates
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="py-4">
            <CardHeader className="px-4 pb-0">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-sm">{VEHICLE.label}</CardTitle>
                  <CardDescription className="text-xs">{VEHICLE.sampleNote}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 px-4 pt-4 sm:grid-cols-2">
              <NumberField
                id="base"
                label="Base fare"
                prefix="₱"
                value={draft.base}
                onChange={(n) => patch({ base: n })}
              />
              <NumberField
                id="perkm"
                label="Per kilometer"
                prefix="₱"
                value={draft.perKm}
                onChange={(n) => patch({ perKm: n })}
              />
              <div className="rounded-md bg-muted/60 px-2.5 py-2 text-xs sm:col-span-2">
                <span className="text-muted-foreground">
                  {VEHICLE.sampleKm} km sample ≈{" "}
                </span>
                <span className="font-semibold">{peso(sample.total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Banknote className="size-4.5 text-muted-foreground" /> Global fees & surge
              </CardTitle>
              <CardDescription>
                Applied to every booking on top of the distance fare.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  id="booking-fee"
                  label="Booking fee (flat per trip)"
                  prefix="₱"
                  value={draft.bookingFee}
                  onChange={(n) => patch({ bookingFee: n })}
                />
                <NumberField
                  id="min-fare"
                  label="Minimum fare (per trip)"
                  prefix="₱"
                  value={draft.minFare}
                  onChange={(n) => patch({ minFare: n })}
                  hint="Trips below this amount are topped up."
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="surge" className="inline-flex items-center gap-1.5 text-sm">
                    <Percent className="size-4 text-muted-foreground" /> Surge multiplier
                  </Label>
                  <Badge variant="secondary" className="font-semibold">
                    {SURGE_LABEL(draft.surgeMultiplier)}
                  </Badge>
                </div>
                <Slider
                  id="surge"
                  value={[draft.surgeMultiplier]}
                  min={SURGE_MIN}
                  max={SURGE_MAX}
                  step={SURGE_STEP}
                  onValueChange={(value) => patch({ surgeMultiplier: Number(value) })}
                  className="py-2"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>1.0× standard</span>
                  <span>2.0× peak</span>
                  <span>3.0× max</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Surge multiplies the base + distance subtotal. Minimum fare is enforced after surge.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Existing bookings keep the fare recorded at booking time. Rates saved here apply to the
              fare calculator and all bookings created afterwards — ready to be backed by a real API
              via <span className="font-medium text-foreground">fareService</span>.
            </p>
          </div>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4.5 text-primary" /> Fare calculator
            </CardTitle>
            <CardDescription>Live preview of what passengers pay.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-emerald-500" /> Pickup
                </Label>
                <Select value={pickupIdx} onValueChange={(v) => v && setPickupIdx(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l, i) => (
                      <SelectItem key={l.name} value={String(i)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>

              <div className="space-y-1.5">
                <Label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" /> Destination
                </Label>
                <Select value={dropoffIdx} onValueChange={(v) => v && setDropoffIdx(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l, i) => (
                      <SelectItem key={l.name} value={String(i)} disabled={String(i) === pickupIdx}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {quote && (
              <>
                <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-semibold">{quote.km.toFixed(1)} km</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fare</span>
                    <span className="tabular-nums">{pesoPrecise(quote.result.base)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Distance ({quote.km.toFixed(1)} km × {peso(draft.perKm)})
                    </span>
                    <span className="tabular-nums">{pesoPrecise(quote.result.distanceCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="tabular-nums">{pesoPrecise(quote.result.subtotal)}</span>
                  </div>
                  {quote.result.surgeAdjustment !== 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Surge ({draft.surgeMultiplier.toFixed(1)}×)</span>
                      <span className="tabular-nums">
                        +{pesoPrecise(quote.result.surgeAdjustment)}
                      </span>
                    </div>
                  )}
                  {quote.result.minimumTopUp > 0 && (
                    <div className="flex justify-between text-sky-600 dark:text-sky-400">
                      <span>Minimum fare top-up</span>
                      <span className="tabular-nums">
                        +{pesoPrecise(quote.result.minimumTopUp)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking fee</span>
                    <span className="tabular-nums">{pesoPrecise(quote.result.bookingFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total fare</span>
                    <span className="text-lg font-bold tabular-nums">
                      {pesoPrecise(quote.result.total)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {quote.pickup.name} → {quote.dropoff.name} · {VEHICLE.label}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
