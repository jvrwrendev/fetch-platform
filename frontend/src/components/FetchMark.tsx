import Svg, { Rect } from "react-native-svg"

import { useThemeColors } from "@/theme"

/**
 * The FETCH monogram: a rounded square with the F cut out.
 *
 * Same artwork as `assets/logo.svg`, drawn with `react-native-svg` so it
 * renders on web and native without a raster. The square follows the theme —
 * dark on light, light on dark — so the mark never disappears into the surface
 * it sits on.
 */
export function FetchMark({
  size = 36,
  className,
}: {
  size?: number
  className?: string
}) {
  const colors = useThemeColors()
  const square = colors.foreground
  const glyph = colors.background

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 96.81 96.81"
      className={className}
    >
      <Rect width="96.81" height="96.81" rx="18" fill={square} />
      <Rect x="24.67" y="24.67" width="47.47" height="11.87" fill={glyph} />
      <Rect x="24.67" y="36.54" width="11.87" height="35.61" fill={glyph} />
      <Rect x="40.06" y="39.98" width="23.74" height="11.87" fill={glyph} />
      <Rect x="40.06" y="51.85" width="11.87" height="20.3" fill={glyph} />
    </Svg>
  )
}
