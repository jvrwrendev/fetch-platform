import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react"
import Svg, { Circle, Path, Polyline } from "react-native-svg"

import type { BookingType } from "@/shared"

/**
 * The three service glyphs, drawn directly with react-native-svg.
 *
 * They are the same artwork as the reference's lucide icons (Bike,
 * ShoppingBasket, Package), inlined here rather than imported so the marks
 * render identically on web and native without depending on the icon
 * library's runtime interop.
 */

interface IconProps {
  size?: number
  color: string
  strokeWidth?: number
}

function Shell({
  size,
  color,
  strokeWidth = 2,
  children,
}: IconProps & { children: ReactNode }) {
  // react-native-svg does not inherit stroke from the root on native, so each
  // child carries the presentation props — the same thing the icon library
  // does internally, and what makes these render on both platforms.
  const attrs: Record<string, unknown> = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none",
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...attrs}>
      {Children.map(children, (child) =>
        isValidElement(child)
          ? cloneElement(
              child as ReactElement<Record<string, unknown>>,
              attrs
            )
          : child
      )}
    </Svg>
  )
}

/** A motorcycle — the "Book ride" service. */
export function RideIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Shell size={size} color={color} strokeWidth={strokeWidth}>
      <Circle cx="18.5" cy="17.5" r="3.5" />
      <Circle cx="5.5" cy="17.5" r="3.5" />
      <Circle cx="15" cy="5" r="1" />
      <Path d="M12 17.5V14l-3-3 4-3 2 3h2" />
    </Shell>
  )
}

/** A shopping basket — the "Pabili" service. */
export function PabiliIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Shell size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="m15 11-1 9" />
      <Path d="m19 11-4-7" />
      <Path d="M2 11h20" />
      <Path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4" />
      <Path d="M4.5 15.5h15" />
      <Path d="m5 11 4-7" />
      <Path d="m9 11 1 9" />
    </Shell>
  )
}

/** A package — the "Pasugo / Padala" service. */
export function PasugoIcon({ size = 20, color, strokeWidth = 2 }: IconProps) {
  return (
    <Shell size={size} color={color} strokeWidth={strokeWidth}>
      <Path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <Path d="M12 22V12" />
      <Polyline points="3.29 7 12 12 20.71 7" />
      <Path d="m7.5 4.27 9 5.15" />
    </Shell>
  )
}

/** Pick the glyph for a booking type. */
export function ServiceIcon({
  type,
  ...props
}: IconProps & { type: BookingType }) {
  if (type === "pabili") return <PabiliIcon {...props} />
  if (type === "padala") return <PasugoIcon {...props} />
  return <RideIcon {...props} />
}
