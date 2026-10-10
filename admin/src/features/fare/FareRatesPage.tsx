import { useEffect, useMemo, useState } from "react"
import {
  CircleAlert,
  Loader2,
  MapPin,
  Moon,
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
import { Switch } from "@/components/ui/switch"
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

/** `22` → `10:00 PM`. */
function hourLabel(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM"
  const display = hour % 12 === 0 ? 12 : hour % 12
  return `${display}:00 ${suffix}`
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

/**
 * A live preview of one trip, day or night, priced by the real engine.
 */
function TripPreview({ config }: { config: FareConfig }) {
  const [pickupIdx, setPickupIdx] = useState("0")
  const [dropoffIdx, setDropoffIdx] = useState("6")

  const pickup = LOCATIONS[Number(pickupIdx)]!
  const dropoff = LOCATIONS[Number(dropoffIdx)]!
  const km = distanceKm(pickup, dropoff)

  const day = quoteFare(config, km, new Date(2026, 9, 10, 12, 0, 0))
  const night = quoteFare(config, km, new Date(2026, 9, 10, 23, 0, 0))

  const rows: { label: string; value: string; muted?: boolean }[] = [
    { label: "Distance", value: `${day.distanceKm.toFixed(1)} km` },
    { label: "Billed distance", value: `${day.billedKm} km` },
    { label: "Base fare", value: pesoPrecise(day.baseFare) },
  ]
  if (day.tier1Charge > 0) {
    rows.push({
      label: `Tier 1 (${day.tier1Km} km × ${peso(config.tier1RatePerKm)})`,
      value: pesoPrecise(day.tier1Charge),
    })
  }
  if (day.tier2Charge > 0) {
    rows.push({
      label: `Tier 2 (${day.tier2Km} km × ${peso(config.tier2RatePerKm)})`,
      value: pesoPrecise(day.tier2Charge),
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
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
                <SelectItem key={l.name} value={String(i)}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="tabular-nums">{row.value}</span>
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Daytime total</span>
          <span className="font-bold tabular-nums">{pesoPrecise(day.total)}</span>
        </div>

        <div className="mt-2 space-y-2 rounded-md bg-muted/50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <Moon className="size-3.5" /> Night preview (11:00 PM)
          </div>
          {night.nightApplied ? (
            <>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {night.nightMode === "flat"
                    ? `Flat +${peso(night.nightValue)}`
                    : `+${night.nightValue}%`}
                </span>
                <span className="tabular-nums">+{pesoPrecise(night.nightSurcharge)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Night total</span>
                <span className="font-bold tabular-nums">{pesoPrecise(night.total)}</span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Night surcharge is off — {pesoPrecise(night.total)} at night too.
            </p>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {pickup.name} → {dropoff.name}
      </p>
    </div>
  )
}

export default function FareRatesPage() {
  const [saved, setSaved] = useState<FareConfig | null>(null)
  const [draft, setDraft] = useState<FareConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [resetting, setResetting] = useState(false)

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fare Rates"
        description="Base, distance tiers and the night surcharge. Every trip is billed by the whole kilometre."
        actions={
          <>
            {dirty && (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              >
                Unsaved changes
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset} disabled={busy || resetting}>
              {resetting ? <Loader2 className="animate-spin" /> : <RotateCcw />} Reset defaults
            </Button>
            <Button onClick={handleSave} disabled={!dirty || busy}>
              {busy ? <Loader2 className="animate-spin" /> : <Save />} Save rates
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Base &amp; distance tiers</CardTitle>
              <CardDescription>
                The base fare covers the first distance; the tiers price the rest.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <NumberField
                id="base-fare"
                label="Base fare"
                prefix="₱"
                value={draft.baseFare}
                onChange={(n) => patch({ baseFare: n })}
                hint={`Covers the first ${draft.baseDistanceKm} km.`}
              />
              <NumberField
                id="base-km"
                label="Base distance (km)"
                value={draft.baseDistanceKm}
                onChange={(n) => patch({ baseDistanceKm: n })}
                min={1}
              />
              <NumberField
                id="tier1-rate"
                label="Tier 1 rate (₱/km)"
                prefix="₱"
                value={draft.tier1RatePerKm}
                onChange={(n) => patch({ tier1RatePerKm: n })}
                hint={`Charged over ${draft.baseDistanceKm} km, up to ${draft.tier1MaxKm} km.`}
              />
              <NumberField
                id="tier1-max"
                label="Tier 1 ends at (km)"
                value={draft.tier1MaxKm}
                onChange={(n) => patch({ tier1MaxKm: n })}
                min={1}
              />
              <NumberField
                id="tier2-rate"
                label="Tier 2 rate (₱/km)"
                prefix="₱"
                value={draft.tier2RatePerKm}
                onChange={(n) => patch({ tier2RatePerKm: n })}
                hint={`Charged beyond ${draft.tier1MaxKm} km.`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Moon className="size-4.5 text-muted-foreground" /> Night ride
                  </CardTitle>
                  <CardDescription>
                    Applied automatically between the night hours when enabled.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {draft.nightRideEnabled ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={draft.nightRideEnabled}
                    onCheckedChange={(nightRideEnabled) => patch({ nightRideEnabled })}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Night starts</Label>
                  <Select
                    value={String(draft.nightStartHour)}
                    onValueChange={(v) => v && patch({ nightStartHour: Number(v) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour} value={String(hour)}>
                          {hourLabel(hour)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Night ends</Label>
                  <Select
                    value={String(draft.nightEndHour)}
                    onValueChange={(v) => v && patch({ nightEndHour: Number(v) })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((hour) => (
                        <SelectItem key={hour} value={String(hour)}>
                          {hourLabel(hour)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Surcharge type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={draft.nightMode === "flat" ? "default" : "outline"}
                    onClick={() => patch({ nightMode: "flat" })}
                    className="min-h-11"
                  >
                    Flat fee
                  </Button>
                  <Button
                    type="button"
                    variant={draft.nightMode === "percentage" ? "default" : "outline"}
                    onClick={() => patch({ nightMode: "percentage" })}
                    className="min-h-11"
                  >
                    Percentage
                  </Button>
                </div>

                {draft.nightMode === "flat" ? (
                  <NumberField
                    id="night-flat"
                    label="Flat night fee"
                    prefix="₱"
                    value={draft.nightFlatFee}
                    onChange={(n) => patch({ nightFlatFee: n })}
                  />
                ) : (
                  <NumberField
                    id="night-percent"
                    label="Night boost (%)"
                    value={draft.nightPercent}
                    onChange={(n) => patch({ nightPercent: n })}
                    hint="Applies to the daytime total."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-start gap-2 rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p>
              Existing bookings keep the fare recorded at booking time. Rates saved
              here apply to the preview and every booking created afterwards.
            </p>
          </div>
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4.5 text-primary" /> Fare calculator
            </CardTitle>
            <CardDescription>Day and night, from the live rate card.</CardDescription>
          </CardHeader>
          <CardContent>
            <TripPreview config={draft} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
