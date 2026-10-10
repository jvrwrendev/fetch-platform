import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import {
  Bell,
  CircleHelp,
  FileText,
  LogOut,
  MapPinned,
  MessageCircle,
  Pencil,
  Scale,
  Ticket,
  UserRound,
  Wallet,
} from "lucide-react-native"
import { useState } from "react"
import { Pressable, View } from "react-native"

import { AppearanceCard } from "@/components/AppearanceCard"
import { ServiceAreaCard } from "@/components/ServiceAreaCard"
import { HeaderPanel } from "@/components/layout/HeaderPanel"
import { SettingGroup, SettingRow } from "@/components/SettingRows"
import { Avatar, initialsOf } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Text } from "@/components/ui/text"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/store/AuthContext"
import { useSettings } from "@/store/SettingsContext"
import { useTheme } from "@/store/ThemeContext"
import {
  LOCATIONS,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/shared"
import { cn } from "@/utils/cn"

type AccountView =
  | "menu"
  | "edit"
  | "notifications"
  | "payment"
  | "places"
  | "area"
  | "appearance"
  | "terms"
  | "privacy"

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: "Cash",
  ewallet: "E-Wallet",
}

const ROLE_LABEL: Record<string, string> = {
  passenger: "Riding with Fetch",
  rider: "Driving with Fetch",
}

const LEGAL: Record<"terms" | "privacy", string[]> = {
  terms: [
    "FETCH connects commuters with motorcycle riders in Bukidnon. This is a mock build — bookings, fares and payments are simulated and no money changes hands.",
    "A fare is a quote, not a promise: it is computed from the distance and the live rate card shown before you confirm.",
  ],
  privacy: [
    "We store what the trip needs — your account, your bookings and your messages — and nothing is sold.",
    "Location is used only to set your pickup and to draw the route. In this mock it stays on the device.",
  ],
}

const TITLES: Record<AccountView, string> = {
  menu: "Account",
  edit: "Edit details",
  notifications: "Notifications",
  payment: "Default payment",
  places: "Saved places",
  area: "Service area",
  appearance: "Appearance",
  terms: "Terms & conditions",
  privacy: "Privacy policy",
}

/**
 * The account surface reached from the header avatar: who you are, the settings
 * that belong to you, your trips and chats, and the way out. Sub-panels open in
 * place rather than as separate routes, mirroring the reference's account sheet.
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<AccountView>("menu")
  const { user, logout } = useAuth()
  const router = useRouter()

  const close = () => {
    setOpen(false)
    setTimeout(() => setView("menu"), 250)
  }

  const go = (path: string) => {
    setOpen(false)
    setTimeout(() => {
      setView("menu")
      router.push(path)
    }, 120)
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityLabel="Account"
        className="size-9 items-center justify-center rounded-full border border-border"
      >
        <Avatar
          initials={initialsOf(user?.name ?? "Fetch")}
          className="size-8"
        />
      </Pressable>

      <HeaderPanel
        open={open}
        onClose={close}
        title={TITLES[view]}
        onBack={view === "menu" ? undefined : () => setView("menu")}
      >
        {view === "menu" ? (
          <MenuView onOpen={setView} onNavigate={go} onSignOut={logout} />
        ) : view === "edit" ? (
          <EditView />
        ) : view === "notifications" ? (
          <NotificationsView />
        ) : view === "payment" ? (
          <PaymentView />
        ) : view === "places" ? (
          <PlacesView />
        ) : view === "area" ? (
          <ServiceAreaCard />
        ) : view === "appearance" ? (
          <AppearanceCard />
        ) : (
          <View className="gap-3">
            {LEGAL[view].map((paragraph) => (
              <Text
                key={paragraph}
                className="text-sm leading-6 text-muted-foreground"
              >
                {paragraph}
              </Text>
            ))}
          </View>
        )}
      </HeaderPanel>
    </>
  )
}

function MenuView({
  onOpen,
  onNavigate,
  onSignOut,
}: {
  onOpen: (view: AccountView) => void
  onNavigate: (path: string) => void
  onSignOut: () => void
}) {
  const { user } = useAuth()
  const { settings } = useSettings()
  const { preference } = useTheme()
  const isRider = user?.role === "rider"
  const base = isRider ? "/rider" : "/passenger"

  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Avatar initials={initialsOf(user?.name ?? "Fetch")} />
        <View className="min-w-0 flex-1">
          <Text className="font-semibold" numberOfLines={1}>
            {user?.name}
          </Text>
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {user?.email}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {user ? ROLE_LABEL[user.role] : ""}
          </Text>
        </View>
        <Button variant="ghost" size="sm" onPress={() => onOpen("edit")}>
          <Pencil size={14} />
          <Text className="text-sm font-medium">Edit</Text>
        </Button>
      </View>

      <SettingGroup title="Preferences">
        <SettingRow
          icon={Bell}
          label="Notifications"
          hint={settings.tripUpdates ? "Trip updates on" : "Trip updates off"}
          onPress={() => onOpen("notifications")}
        />
        {!isRider ? (
          <>
            <SettingRow
              icon={Wallet}
              label="Default payment"
              hint={PAYMENT_LABEL[settings.defaultPaymentMethod]}
              onPress={() => onOpen("payment")}
            />
            <SettingRow
              icon={MapPinned}
              label="Saved places"
              hint={
                settings.savedPlaces.length > 0
                  ? `${settings.savedPlaces.length} saved`
                  : "None yet"
              }
              onPress={() => onOpen("places")}
            />
          </>
        ) : null}
        <SettingRow
          icon={MapPinned}
          label="Service area"
          hint="Malaybalay · Valencia"
          onPress={() => onOpen("area")}
        />
        <SettingRow
          icon={UserRound}
          label="Appearance"
          hint={
            preference === "system"
              ? "System"
              : preference === "dark"
                ? "Dark"
                : "Light"
          }
          onPress={() => onOpen("appearance")}
        />
      </SettingGroup>

      <SettingGroup title="Activity">
        <SettingRow
          icon={Ticket}
          label="Trips"
          onPress={() => onNavigate(`${base}/history`)}
        />
        <SettingRow
          icon={MessageCircle}
          label="Chats"
          onPress={() => onNavigate(`${base}/chats`)}
        />
      </SettingGroup>

      <SettingGroup title="Others">
        <SettingRow
          icon={CircleHelp}
          label="Help & support"
          hint="support@fetch.ph"
          onPress={() => void Linking.openURL("mailto:support@fetch.ph")}
        />
        <SettingRow
          icon={FileText}
          label="Terms & conditions"
          onPress={() => onOpen("terms")}
        />
        <SettingRow
          icon={Scale}
          label="Privacy policy"
          onPress={() => onOpen("privacy")}
        />
        <SettingRow
          icon={LogOut}
          label="Sign out"
          destructive
          onPress={onSignOut}
        />
      </SettingGroup>
    </View>
  )
}

function EditView() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Label>Full name</Label>
        <Input value={name} onChangeText={setName} />
      </View>
      <View className="gap-2">
        <Label>Phone</Label>
        <Input
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>
      <Button
        onPress={() => {
          updateProfile({ name: name.trim(), phone: phone.trim() })
          toast.success("Details saved")
        }}
      >
        Save changes
      </Button>
    </View>
  )
}

function NotificationsView() {
  const { settings, update } = useSettings()
  return (
    <View className="gap-3">
      <SettingRow
        icon={Bell}
        label="Trip updates"
        hint="Ride status and rider updates"
        right={
          <Switch
            value={settings.tripUpdates}
            onValueChange={(tripUpdates) => update({ tripUpdates })}
          />
        }
      />
      <SettingRow
        icon={Bell}
        label="Promos and news"
        hint="Occasional announcements"
        right={
          <Switch
            value={settings.promos}
            onValueChange={(promos) => update({ promos })}
          />
        }
      />
    </View>
  )
}

function PaymentView() {
  const { settings, update } = useSettings()
  return (
    <View className="gap-3">
      <Text className="text-sm text-muted-foreground">
        What the booking flow selects first.
      </Text>
      <View className="flex-row gap-2">
        {PAYMENT_METHODS.map((method) => {
          const active = settings.defaultPaymentMethod === method
          return (
            <Pressable
              key={method}
              onPress={() => update({ defaultPaymentMethod: method })}
              className={cn(
                "flex-1 items-center rounded-lg border p-3",
                active ? "border-primary bg-primary" : "border-border"
              )}
            >
              <Text
                className={cn(
                  "text-sm font-medium",
                  active ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {PAYMENT_LABEL[method]}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function PlacesView() {
  const { settings, addSavedPlace, removeSavedPlace } = useSettings()
  const [adding, setAdding] = useState(false)

  return (
    <View className="gap-3">
      {settings.savedPlaces.length === 0 ? (
        <Text className="text-sm text-muted-foreground">
          No saved places yet.
        </Text>
      ) : (
        settings.savedPlaces.map((place) => (
          <View key={place.id} className="flex-row items-center gap-2">
            <View className="min-w-0 flex-1">
              <SettingRow
                icon={MapPinned}
                label={place.label}
                hint={place.point.name}
              />
            </View>
            <Pressable
              onPress={() => removeSavedPlace(place.id)}
              className="pr-2"
            >
              <Text className="text-xs text-destructive">Remove</Text>
            </Pressable>
          </View>
        ))
      )}

      {adding ? (
        <View className="gap-2">
          <Text className="text-xs text-muted-foreground">
            Pick a place to save
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {LOCATIONS.map((location) => (
              <Pressable
                key={location.name}
                onPress={() => {
                  addSavedPlace(location.name, location)
                  setAdding(false)
                  toast.success("Place saved")
                }}
                className="rounded-full border border-border px-3 py-1.5"
              >
                <Text className="text-xs">{location.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : (
        <Button variant="outline" size="sm" onPress={() => setAdding(true)}>
          <Text className="text-sm font-medium">Add a place</Text>
        </Button>
      )}
    </View>
  )
}
