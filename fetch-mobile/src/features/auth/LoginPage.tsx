import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Car, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "./AuthContext"
import type { Role } from "@/lib/types"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = (role: Role) => (e: FormEvent) => {
    e.preventDefault()
    login(role)
    navigate(role === "rider" ? "/rider" : "/passenger")
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold">Fetch</h1>
          <p className="text-muted-foreground">
            Sign in with a demo account to continue
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Demo Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Any credentials work — pick your role:
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={handleLogin("passenger")} variant="default">
                  <Navigation /> Passenger
                </Button>
                <Button onClick={handleLogin("rider")} variant="outline">
                  <Car /> Rider
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
