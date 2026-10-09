import { Plus, X } from "lucide-react-native"
import { Pressable, View } from "react-native"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Text } from "@/components/ui/text"
import { useThemeColors } from "@/theme"
import type { BookingErrandItem } from "@/shared"

interface ErrandFieldsProps {
  type: "pabili" | "padala"
  items: BookingErrandItem[]
  onItemsChange: (items: BookingErrandItem[]) => void
  budget: string
  onBudgetChange: (value: string) => void
  recipientName: string
  onRecipientNameChange: (value: string) => void
  recipientPhone: string
  onRecipientPhoneChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}

/** The extra inputs a pabili or pasugo needs on top of the trip. */
export function ErrandFields({
  type,
  items,
  onItemsChange,
  budget,
  onBudgetChange,
  recipientName,
  onRecipientNameChange,
  recipientPhone,
  onRecipientPhoneChange,
  notes,
  onNotesChange,
}: ErrandFieldsProps) {
  const colors = useThemeColors()

  const update = (index: number, patch: Partial<BookingErrandItem>) => {
    onItemsChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item))
    )
  }

  const add = () => onItemsChange([...items, { name: "", qty: 1 }])

  const remove = (index: number) =>
    onItemsChange(items.filter((_, i) => i !== index))

  return (
    <View className="gap-4">
      <View className="gap-2">
        <Text className="text-sm font-medium">
          {type === "pabili" ? "Shopping list" : "What to deliver"}
        </Text>
        {items.map((item, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <Input
              className="flex-1"
              value={item.name}
              onChangeText={(name) => update(index, { name })}
              placeholder={type === "pabili" ? "Item to buy" : "Item to deliver"}
            />
            <Input
              className="w-16"
              value={String(item.qty)}
              onChangeText={(value) =>
                update(index, {
                  qty: Math.max(1, Number(value.replace(/[^0-9]/g, "")) || 1),
                })
              }
              keyboardType="number-pad"
              placeholder="Qty"
            />
            <Pressable
              onPress={() => remove(index)}
              className="size-11 items-center justify-center rounded-md border border-border"
            >
              <X size={16} color={colors.foreground} />
            </Pressable>
          </View>
        ))}
        <Button variant="outline" size="sm" onPress={add}>
          <Plus size={14} color={colors.foreground} />
          <Text className="text-sm font-medium">
            {type === "pabili" ? "Add item" : "Add another"}
          </Text>
        </Button>
      </View>

      {type === "pabili" ? (
        <View className="gap-2">
          <Label>Budget for the purchase (₱)</Label>
          <Input
            value={budget}
            onChangeText={onBudgetChange}
            keyboardType="number-pad"
            placeholder="e.g. 300"
          />
        </View>
      ) : (
        <>
          <View className="gap-2">
            <Label>Recipient name</Label>
            <Input
              value={recipientName}
              onChangeText={onRecipientNameChange}
              placeholder="Who receives it"
            />
          </View>
          <View className="gap-2">
            <Label>Recipient phone</Label>
            <Input
              value={recipientPhone}
              onChangeText={onRecipientPhoneChange}
              keyboardType="phone-pad"
              placeholder="+63 9XX XXX XXXX"
            />
          </View>
        </>
      )}

      <View className="gap-2">
        <Label>Notes (optional)</Label>
        <Input
          value={notes}
          onChangeText={onNotesChange}
          placeholder="Anything the rider should know"
        />
      </View>
    </View>
  )
}
