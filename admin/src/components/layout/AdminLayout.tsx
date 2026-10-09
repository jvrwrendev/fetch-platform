import { useEffect } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  BadgeDollarSign,
  Bell,
  Car,
  CircleUserRound,
  Gauge,
  LayoutDashboard,
  LogOut,
  Map,
  Moon,
  ChartColumn,
  Settings,
  Sun,
  UsersRound,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/features/auth/AuthContext"
import { useNotifications } from "@/features/notifications/NotificationsContext"
import { cn } from "@/lib/utils"

interface NavLinkItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
}

const mainNav: NavLinkItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/passengers", label: "Passengers", icon: UsersRound },
  { to: "/riders", label: "Riders", icon: Car },
  { to: "/bookings", label: "Bookings", icon: Gauge },
  { to: "/live-map", label: "Live Rider Map", icon: Map },
]

const insightNav: NavLinkItem[] = [
  { to: "/reports", label: "Reports", icon: ChartColumn },
  { to: "/notifications", label: "Notifications", icon: Bell },
]

const accountNav: NavLinkItem[] = [
  { to: "/profile", label: "Admin Profile", icon: CircleUserRound },
]

const configNav: NavLinkItem[] = [
  { to: "/fare-rates", label: "Fare Rates", icon: BadgeDollarSign },
  { to: "/settings", label: "Settings", icon: Settings },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { unreadCount } = useNotifications()
  const { pathname } = useLocation()
  const renderGroup = (label: string, items: NavLinkItem[]) => (
    <SidebarGroup key={label}>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ to, label: itemLabel, icon: Icon, end }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton
                isActive={end ? pathname === to : pathname.startsWith(to)}
                tooltip={itemLabel}
                render={<NavLink to={to} end={end} onClick={onNavigate} />}
              >
                <Icon />
                <span>{itemLabel}</span>
                {to === "/notifications" && unreadCount > 0 && (
                  <Badge
                    variant="outline"
                    className="ml-auto bg-destructive/10 px-1.5 text-destructive dark:bg-destructive/20"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <>
      {renderGroup("Overview", mainNav)}
      {renderGroup("Insights", insightNav)}
      {renderGroup("Configuration", configNav)}
      {renderGroup("Account", accountNav)}
    </>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="size-4.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  )
}

function Header() {
  const { admin, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const title =
    [...mainNav, ...insightNav, ...configNav, ...accountNav].find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label ?? "Dashboard"

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur">
      <SidebarTrigger />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Fetch Admin Console · Metro Manila
        </p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="size-4.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {admin?.initials ?? "AD"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {admin?.name ?? "Admin"}
                </span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{admin?.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{admin?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <CircleUserRound /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

function CloseMobileOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar()
  const { pathname } = useLocation()
  useEffect(() => {
    if (isMobile) setOpenMobile(false)
  }, [pathname, isMobile, setOpenMobile])
  return null
}

export default function AdminLayout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <CloseMobileOnNavigate />
      <SidebarRoot collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<NavLink to="/" />}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-sm font-bold">F</span>
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">Fetch Admin</span>
                  <span className="truncate text-xs text-muted-foreground">Ride Platform</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavItems />
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </SidebarRoot>

      <SidebarInset className={cn("min-w-0")}>
        <Header />
        <main
          key={location.pathname}
          className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6"
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
