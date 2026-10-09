import { useEffect } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

export interface MapMarker {
  position: [number, number]
  label: string
  color?: string
  popup?: React.ReactNode
}

function makeIcon(color = "#2563eb", pulse = false) {
  return L.divIcon({
    className: "",
    html: pulse
      ? `<div style="position:relative;width:22px;height:22px">
          <span style="position:absolute;inset:0;border-radius:9999px;background:${color}33;animation:rider-pulse 1.8s ease-out infinite"></span>
          <span style="position:absolute;inset:5px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.45)"></span>
        </div>
        <style>@keyframes rider-pulse{0%{transform:scale(.6);opacity:.9}100%{transform:scale(1.7);opacity:0}}</style>`
      : `<div style="width:16px;height:16px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: pulse ? [22, 22] : [16, 16],
    iconAnchor: pulse ? [11, 11] : [8, 8],
  })
}

function FitBounds({ points, flyKey }: { points: [number, number][]; flyKey?: string }) {
  const map = useMap()
  useEffect(() => {
    if (points.length === 0) return
    if (points.length === 1) {
      map.flyTo(points[0]!, Math.max(map.getZoom(), 14), { duration: 0.5 })
      return
    }
    map.flyToBounds(L.latLngBounds(points), {
      padding: [40, 40],
      duration: 0.5,
      maxZoom: 15,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyKey, map])
  return null
}

export function MapView({
  center = [14.5995, 121.0244],
  zoom = 12,
  markers = [],
  height = 420,
  className,
  fitKey,
}: {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  height?: number | string
  className?: string
  fitKey?: string
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m, i) => (
        <Marker
          key={`${m.label}-${i}`}
          position={m.position}
          icon={makeIcon(m.color, m.color === "#10b981" || m.color === "#f59e0b")}
        >
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
      {markers.length > 0 && (
        <FitBounds points={markers.map((m) => m.position)} flyKey={fitKey} />
      )}
    </MapContainer>
  )
}
