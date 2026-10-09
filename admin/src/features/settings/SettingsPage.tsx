import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Globe, Loader2, Monitor, Moon, Save, Sun } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import { settingsService } from "@/lib/services"
import type { AdminSettings } from "@/lib/types"

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    settingsService.getSettings().then((s) => {
      setSettings(s)
      setLoaded(true)
    })
  }, [])

  if (!settings || !loaded) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Loading preferences…" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-lg border bg-card" />
          <div className="h-64 animate-pulse rounded-lg border bg-card" />
        </div>
      </div>
    )
  }

  const update = (patch: Partial<AdminSettings>) => setSettings((prev) => ({ ...prev!, ...patch }))

  const handleTheme = (value: AdminSettings["theme"]) => {
    setTheme(value)
    update({ theme: value })
  }

  const handleSave = async () => {
    setBusy(true)
    try {
      await settingsService.updateSettings(settings)
      toast.success("Settings saved.")
    } catch {
      toast.error("Could not save settings.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Console preferences, notifications, and regional options."
        actions={
          <Button onClick={handleSave} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Save />} Save changes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how the console looks on this device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {THEME_OPTIONS.map((option) => {
                const Icon = option.icon
                const active = theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleTheme(option.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors ${
                      active
                        ? "border-primary bg-primary/5 font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={settings.language} onValueChange={(v) => update({ language: v ?? settings.language })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English (Philippines)">
                    <Globe className="size-4" /> English (Philippines)
                  </SelectItem>
                  <SelectItem value="Filipino">Filipino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => update({ timezone: v ?? settings.timezone })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Manila (UTC+8)">Asia/Manila (UTC+8)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={settings.currency} onValueChange={(v) => update({ currency: v ?? settings.currency })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHP (₱)">PHP (₱)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control which events reach your inbox.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              {
                key: "emailNotifications" as const,
                label: "Email notifications",
                description: "Send console alerts to your email address.",
              },
              {
                key: "bookingAlerts" as const,
                label: "Booking alerts",
                description: "Get notified about cancellations and surge periods.",
              },
              {
                key: "riderApprovalAlerts" as const,
                label: "Rider approval alerts",
                description: "Ping when a new rider application needs review.",
              },
              {
                key: "weeklyReportDigest" as const,
                label: "Weekly report digest",
                description: "Receive a Monday summary of revenue and trips.",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label htmlFor={item.key} className="cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch
                  id={item.key}
                  checked={settings[item.key]}
                  onCheckedChange={(checked) => update({ [item.key]: checked })}
                />
              </div>
            ))}
            <Separator />
            <p className="text-xs text-muted-foreground">
              Preferences are stored in memory for this demo session and reset on refresh.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
