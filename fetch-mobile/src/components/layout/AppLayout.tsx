import { NavLink, Outlet } from "react-router-dom"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { useAuth } from "@/features/auth/AuthContext"

export interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export default function AppLayout({ items }: { items: NavItem[] }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-svh bg-muted/30 pb-20 md:pb-0">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <span className="text-lg font-bold">Fetch</span>
          <nav className="hidden flex-1 gap-1 md:flex">
            {items.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to.split("/").length === 2}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>
                {user?.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm sm:inline">{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-4">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background md:hidden">
        <div className="flex">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to.split("/").length === 2}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
