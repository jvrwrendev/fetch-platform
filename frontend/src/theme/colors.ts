/**
 * The FETCH palette as raw hexes, so NativeWind classes and the few places
 * that still need a concrete color (map markers, status bar, SVG fills) agree.
 * Values mirror the web app's `index.css` tokens (neutral, light).
 */
const colors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: "#ffffff",
  "card-foreground": "#0a0a0a",
  popover: "#ffffff",
  "popover-foreground": "#0a0a0a",
  primary: "#171717",
  "primary-foreground": "#fafafa",
  secondary: "#f5f5f5",
  "secondary-foreground": "#171717",
  muted: "#f5f5f5",
  "muted-foreground": "#737373",
  accent: "#f5f5f5",
  "accent-foreground": "#171717",
  destructive: "#e7000b",
  border: "#e5e5e5",
  input: "#e5e5e5",
  ring: "#a1a1a1",
  success: "#16a34a",
  info: "#2563eb",
}

export default colors
export const mapColors = {
  pickup: "#16a34a",
  dropoff: "#dc2626",
  rider: "#2563eb",
  route: "#171717",
}
