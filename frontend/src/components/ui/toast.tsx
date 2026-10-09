import * as React from "react"
import { View } from "react-native"
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated"
import { CheckCircle2, Info, XCircle } from "lucide-react-native"

import { Text } from "@/components/ui/text"

type ToastKind = "success" | "error" | "info"

interface ToastItem {
  id: number
  kind: ToastKind
  title: string
  description?: string
}

type Listener = (item: ToastItem) => void

const listeners = new Set<Listener>()
let nextId = 1

function emit(kind: ToastKind, title: string, description?: string) {
  const item: ToastItem = { id: nextId++, kind, title, description }
  listeners.forEach((listener) => listener(item))
}

interface ToastOptions {
  description?: string
}

/**
 * The native stand-in for the web app's `sonner` toasts: a module-level
 * `toast()` that any screen can call, rendered by `<ToastHost />` in the root
 * layout. Same call shape as the web app.
 */
export const toast = Object.assign(
  (title: string, options?: ToastOptions) => emit("info", title, options?.description),
  {
    success: (title: string, options?: ToastOptions) =>
      emit("success", title, options?.description),
    error: (title: string, options?: ToastOptions) =>
      emit("error", title, options?.description),
    info: (title: string, options?: ToastOptions) =>
      emit("info", title, options?.description),
    message: (title: string, options?: ToastOptions) =>
      emit("info", title, options?.description),
  }
)

const ICONS: Record<ToastKind, React.ComponentType<{ size?: number; color?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ICON_COLOR: Record<ToastKind, string> = {
  success: "#16a34a",
  error: "#e7000b",
  info: "#2563eb",
}

export function ToastHost() {
  const [items, setItems] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    const listener: Listener = (item) => {
      setItems((prev) => [...prev, item])
      setTimeout(() => {
        setItems((prev) => prev.filter((entry) => entry.id !== item.id))
      }, 3200)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return (
    <View
      pointerEvents="box-none"
      className="absolute inset-x-0 top-0 z-50 items-center gap-2 px-4 pt-14"
    >
      {items.map((item) => {
        const Icon = ICONS[item.kind]
        return (
          <Animated.View
            key={item.id}
            entering={FadeInUp}
            exiting={FadeOutUp}
            className="w-full max-w-md flex-row items-start gap-3 rounded-lg border border-border bg-card p-3"
          >
            <Icon size={18} color={ICON_COLOR[item.kind]} />
            <View className="flex-1 gap-0.5">
              <Text className="text-sm font-medium">{item.title}</Text>
              {item.description ? (
                <Text className="text-xs text-muted-foreground">
                  {item.description}
                </Text>
              ) : null}
            </View>
          </Animated.View>
        )
      })}
    </View>
  )
}
