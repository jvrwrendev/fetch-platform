import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/features/auth/AuthContext"

export default function PassengerProfile() {
  const { user, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")

  const save = () => {
    updateProfile({ name, phone })
    toast.success("Profile updated")
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>{user?.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {user?.email} · Rating {user?.rating} · {user?.totalTrips} trips
          </p>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>Save</Button>
            <Button
              variant="outline"
              onClick={() => {
                logout()
                navigate("/login")
              }}
            >
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
