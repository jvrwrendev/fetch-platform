import { useColorScheme } from "nativewind"

/**
 * The palette as concrete hexes, mirroring the HSL channels in
 * `src/theme/global.css`. Tailwind classes (bg-background, text-foreground, …)
 * are the normal way to color things; use this object only where a raw color is
 * unavoidable — icon `color`, SVG `fill`/`stroke`, `ActivityIndicator`, inline
 * `style`, and navigator `screenOptions`.
 *
 * If you change a value in `global.css`, change it here too.
 */
export const LIGHT_COLORS = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#ffffff",
  cardForeground: "#0a0a0a",
  popover: "#ffffff",
  popoverForeground: "#0a0a0a",
  primary: "#171717",
  primaryForeground: "#fafafa",
  secondary: "#f5f5f5",
  secondaryForeground: "#171717",
  muted: "#f5f5f5",
  mutedForeground: "#737373",
  accent: "#f5f5f5",
  accentForeground: "#171717",
  destructive: "#e7000b",
  destructiveForeground: "#fafafa",
  border: "#e5e5e5",
  input: "#e5e5e5",
  ring: "#a1a1a1",
  success: "#16a34a",
  successForeground: "#fafafa",
  info: "#2563eb",
  infoForeground: "#fafafa",
}

export type ThemeColors = typeof LIGHT_COLORS

export const DARK_COLORS: ThemeColors = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  card: "#171717",
  cardForeground: "#fafafa",
  popover: "#171717",
  popoverForeground: "#fafafa",
  primary: "#fafafa",
  primaryForeground: "#171717",
  secondary: "#262626",
  secondaryForeground: "#fafafa",
  muted: "#262626",
  mutedForeground: "#a3a3a3",
  accent: "#262626",
  accentForeground: "#fafafa",
  destructive: "#ff6467",
  destructiveForeground: "#fafafa",
  border: "#262626",
  input: "#262626",
  ring: "#525252",
  success: "#22c55e",
  successForeground: "#0a0a0a",
  info: "#3b82f6",
  infoForeground: "#0a0a0a",
}

/** The palette for the active color scheme, for raw-color call sites. */
export function useThemeColors(): ThemeColors {
  const { colorScheme } = useColorScheme()
  return colorScheme === "dark" ? DARK_COLORS : LIGHT_COLORS
}
