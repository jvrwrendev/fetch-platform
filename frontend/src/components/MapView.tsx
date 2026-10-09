import { useState } from "react"
import { Pressable, View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native"
import Svg, { Circle, Polyline, Rect } from "react-native-svg"

import { mapColors } from "@/theme/colors"
import type { MapViewProps } from "./mapTypes"

/**
 * Web fallback for the map. `react-native-maps` is native-only, so the browser
 * build draws the same markers and route as SVG over a guessed bounding box,
 * and turns taps back into coordinates. Good enough for the mock demo.
 */
export default function MapView({
  center,
  markers = [],
  route = [],
  height = 260,
  onMapClick,
  className,
}: MapViewProps) {
  const [size, setSize] = useState({ width: 0, height })

  const points = [
    ...markers.map((marker) => [marker.lat, marker.lng] as const),
    ...route.map((point) => [point.lat, point.lng] as const),
    ...(center ? [[center.lat, center.lng] as const] : []),
  ]

  const bounds = boundsOf(points)
  const width = size.width || 320

  const project = (lat: number, lng: number) => ({
    x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width,
    y: ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * height,
  })

  const handlePress = (event: GestureResponderEvent) => {
    if (!onMapClick) return
    const { locationX, locationY } = event.nativeEvent
    const lng =
      bounds.minLng + (locationX / width) * (bounds.maxLng - bounds.minLng)
    const lat =
      bounds.maxLat - (locationY / height) * (bounds.maxLat - bounds.minLat)
    onMapClick({ lat, lng })
  }

  const routePoints = route
    .map((point) => {
      const { x, y } = project(point.lat, point.lng)
      return `${x},${y}`
    })
    .join(" ")

  const onLayout = (event: LayoutChangeEvent) => {
    setSize({
      width: event.nativeEvent.layout.width,
      height: event.nativeEvent.layout.height,
    })
  }

  return (
    <Pressable onPress={handlePress} className={className}>
      <View
        onLayout={onLayout}
        style={{ height }}
        className="w-full overflow-hidden rounded-xl border border-border bg-secondary"
      >
        {size.width > 0 ? (
          <Svg width={size.width} height={height}>
            <Rect width={size.width} height={height} fill="#f5f5f5" />
            {routePoints ? (
              <Polyline
                points={routePoints}
                fill="none"
                stroke={mapColors.route}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {markers.map((marker, index) => {
              const { x, y } = project(marker.lat, marker.lng)
              const color = marker.color ?? mapColors.rider
              return (
                <Circle
                  key={`${marker.lat}-${marker.lng}-${index}`}
                  cx={x}
                  cy={y}
                  r={marker.variant === "location" ? 9 : 7}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              )
            })}
          </Svg>
        ) : null}
      </View>
    </Pressable>
  )
}

function boundsOf(points: readonly (readonly [number, number])[]) {
  if (points.length === 0) {
    return { minLat: 14.5, maxLat: 14.7, minLng: 120.95, maxLng: 121.1 }
  }
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const [lat, lng] of points) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }
  const padLat = Math.max((maxLat - minLat) * 0.25, 0.005)
  const padLng = Math.max((maxLng - minLng) * 0.25, 0.005)
  return {
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
  }
}
