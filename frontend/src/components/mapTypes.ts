export interface MapMarker {
  lat: number
  lng: number
  label?: string
  color?: string
  variant?: "dot" | "location"
}

export interface MapViewProps {
  center?: { lat: number; lng: number }
  markers?: MapMarker[]
  route?: { lat: number; lng: number }[]
  height?: number
  onMapClick?: (pos: { lat: number; lng: number }) => void
  markersDraggable?: boolean
  onMarkerDragEnd?: (index: number, pos: { lat: number; lng: number }) => void
  className?: string
}
