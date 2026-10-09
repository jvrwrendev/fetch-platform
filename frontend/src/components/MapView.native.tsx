import { View } from "react-native"
import RNMapView, { Marker, Polyline } from "react-native-maps"

import { mapColors } from "@/theme/colors"
import type { MapViewProps } from "./mapTypes"

/**
 * Native map. `react-native-maps` ships with Expo Go, so the mock demo shows a
 * real map with tappable coordinates. The web build uses the sibling SVG
 * component instead.
 */
export default function MapView({
  center,
  markers = [],
  route = [],
  height = 260,
  onMapClick,
  markersDraggable = false,
  onMarkerDragEnd,
  className,
}: MapViewProps) {
  const region = regionOf(center, markers, route)

  return (
    <View
      style={{ height }}
      className={`w-full overflow-hidden rounded-xl border border-border ${className ?? ""}`}
    >
      <RNMapView
        style={{ flex: 1 }}
        initialRegion={region}
        onPress={
          onMapClick
            ? (event) =>
                onMapClick({
                  lat: event.nativeEvent.coordinate.latitude,
                  lng: event.nativeEvent.coordinate.longitude,
                })
            : undefined
        }
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        {route.length > 1 ? (
          <Polyline
            coordinates={route.map((point) => ({
              latitude: point.lat,
              longitude: point.lng,
            }))}
            strokeColor={mapColors.route}
            strokeWidth={4}
          />
        ) : null}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.lat}-${marker.lng}-${index}`}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.label}
            pinColor={marker.color ?? mapColors.rider}
            draggable={markersDraggable}
            onDragEnd={
              markersDraggable && onMarkerDragEnd
                ? (event) =>
                    onMarkerDragEnd(index, {
                      lat: event.nativeEvent.coordinate.latitude,
                      lng: event.nativeEvent.coordinate.longitude,
                    })
                : undefined
            }
          />
        ))}
      </RNMapView>
    </View>
  )
}

function regionOf(
  center: { lat: number; lng: number } | undefined,
  markers: { lat: number; lng: number }[],
  route: { lat: number; lng: number }[]
) {
  const points = [
    ...markers,
    ...route,
    ...(center ? [center] : []),
  ]
  if (points.length === 0) {
    return {
      latitude: 14.5547,
      longitude: 121.0244,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }
  }
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const point of points) {
    minLat = Math.min(minLat, point.lat)
    maxLat = Math.max(maxLat, point.lat)
    minLng = Math.min(minLng, point.lng)
    maxLng = Math.max(maxLng, point.lng)
  }
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.6, 0.02),
    longitudeDelta: Math.max((maxLng - minLng) * 1.6, 0.02),
  }
}
