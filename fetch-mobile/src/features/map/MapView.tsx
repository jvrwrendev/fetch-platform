import { useEffect } from "react"
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface MapMarker {
  position: [number, number]
  label: string
  color?: string
  variant?: "dot" | "location"
}

interface MapViewProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  route?: [number, number][]
  height?: number | string
  className?: string
  onMapClick?: (pos: { lat: number; lng: number }) => void
  markersDraggable?: boolean
  onMarkerDragEnd?: (index: number, pos: { lat: number; lng: number }) => void
}

function makeIcon(color = "#2563eb", variant: "dot" | "location" = "dot") {
  if (variant === "location") {
    return L.divIcon({
      className: "",
      html: `<div style="position:relative;width:20px;height:20px">
        <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(37,99,235,.25);animation:loc-pulse 1.6s ease-out infinite"></span>
        <span style="position:absolute;inset:5px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></span>
      </div>
      <style>@keyframes loc-pulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.6);opacity:0}}</style>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    })
  }
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap()
  const key = points.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join(";")
  useEffect(() => {
    const pts = key
      .split(";")
      .filter(Boolean)
      .map((s) => s.split(",").map(Number) as [number, number])
    if (pts.length > 1) {
      map.flyToBounds(L.latLngBounds(pts), {
        padding: [40, 40],
        duration: 0.6,
        maxZoom: 16,
      })
    } else if (pts.length === 1) {
      map.flyTo(pts[0], Math.max(map.getZoom(), 15), { duration: 0.6 })
    }
  }, [map, key])
  return null
}

function ClickHandler({
  onMapClick,
}: {
  onMapClick?: (pos: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      onMapClick?.({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function MapView({
  center = [14.5995, 121.0244],
  zoom = 12,
  markers = [],
  route = [],
  height = 320,
  className,
  onMapClick,
  markersDraggable = false,
  onMarkerDragEnd,
}: MapViewProps) {
  const points: [number, number][] = [
    ...markers.map((m) => m.position),
    ...route,
  ]
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height, width: "100%", borderRadius: "0.5rem" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={m.position}
          icon={makeIcon(m.color, m.variant)}
          draggable={markersDraggable}
          eventHandlers={
            markersDraggable
              ? {
                  dragend: (e) => {
                    const ll = (e.target as L.Marker).getLatLng()
                    onMarkerDragEnd?.(i, { lat: ll.lat, lng: ll.lng })
                  },
                }
              : undefined
          }
        />
      ))}
      {route.length > 1 && (
        <Polyline positions={route} pathOptions={{ color: "#2563eb", weight: 4 }} />
      )}
      {points.length > 0 && <FitBounds points={points} />}
    </MapContainer>
  )
}
