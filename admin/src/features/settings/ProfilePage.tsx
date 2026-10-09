import { useState, type FormEvent } from "react"
import { Loader2, Save } from "lucide-react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { PageHeader } from "@/components/shared/PageHeader"
import { useAuth } from "@/features/auth/AuthContext"
import { settingsService } from "@/lib/services"
import { formatDate, initialsOf } from "@/lib/format"

export default function ProfilePage() {
  const { admin, updateProfile } = useAuth()
  const [name, setName] = useState(admin?.name ?? "")
  const [email, setEmail] = useState(admin?.email ?? "")
  const [phone, setPhone] = useState(admin?.phone ?? "")
  const [busy, setBusy] = useState(false)

  if (!admin) return null

  const dirty = name !== admin.name || email !== admin.email || phone !== admin.phone

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    try {
      const updated = await settingsService.updateProfile({ name, email, phone })
      updateProfile(updated)
      toast.success("Profile updated.")
    } catch {
      toast.error("Could not save profile.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Profile"
        description="Your administrator identity and contact details."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Current session details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                  {admin.initials || initialsOf(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{admin.name}</p>
                <p className="truncate text-sm text-muted-foreground">{admin.role}</p>
              </div>
            </div>
            <Separator />
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Admin ID</dt>
                <dd className="font-medium">{admin.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Base</dt>
                <dd className="font-medium">{admin.city}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{formatDate(admin.joinedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Access level</dt>
                <dd className="font-medium">Full console</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>Update the details shown across the console.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={admin.role} disabled />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {dirty && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setName(admin.name)
                      setEmail(admin.email)
                      setPhone(admin.phone)
                    }}
                  >
                    Reset
                  </Button>
                )}
                <Button type="submit" disabled={!dirty || busy}>
                  {busy ? <Loader2 className="animate-spin" /> : <Save />} Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
