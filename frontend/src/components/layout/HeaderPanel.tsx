import { ArrowLeft, X } from "lucide-react-native"
import type { ReactNode } from "react"
import { Modal, Pressable, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Text } from "@/components/ui/text"
import { useThemeColors } from "@/theme"

/**
 * A bottom panel with a dimmed backdrop, shared by the header bell and the
 * account menu. Same shape both times so the top bar has one interaction.
 */
export function HeaderPanel({
  open,
  onClose,
  title,
  onBack,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  /** When set, the title row shows a back arrow (for sub-panels). */
  onBack?: () => void
  children: ReactNode
}) {
  const insets = useSafeAreaInsets()
  const colors = useThemeColors()

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityLabel="Close"
        />
        <View
          className="max-h-[85%] rounded-t-2xl border-t border-border bg-card px-4 pt-4"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="mb-3 flex-row items-center gap-2">
            {onBack ? (
              <Pressable
                onPress={onBack}
                accessibilityLabel="Back"
                className="size-9 items-center justify-center rounded-full border border-border"
              >
                <ArrowLeft size={16} color={colors.foreground} />
              </Pressable>
            ) : null}
            <Text className="flex-1 text-base font-semibold tracking-tight">
              {title}
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Close"
              className="size-9 items-center justify-center rounded-full border border-border"
            >
              <X size={16} color={colors.foreground} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
