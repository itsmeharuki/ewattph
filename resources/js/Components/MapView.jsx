import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export const PH_BOUNDS = [
  [4.4, 115.2], // SW
  [20.6, 126.7], // NE
]

const statusColor = {
  pending: '#F59E0B',
  verified: '#CE1126',
  resolved: '#10B981',
}

function validCoord(lng, lat) {
  return typeof lng === 'number' && typeof lat === 'number' && isFinite(lng) && isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90
}

/**
 * National outage map — Leaflet + OpenStreetMap tiles.
 * Exposes `mapRef` via the container DOM element so parent can add Leaflet controls.
 */
export default function MapView({ reports = [], riskZones = [], onSelectReport, className = 'h-full w-full' }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const circlesRef = useRef([])

  useEffect(() => {
    const el = containerRef.current
    if (!el || mapRef.current) return

    const map = L.map(el, {
      center: [12.9, 121.0],
      zoom: 6,
      minZoom: 5,
      maxZoom: 16,
      maxBounds: [[3, 114], [22, 128]],
      maxBoundsViscosity: 0.8,
      zoomControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    map.fitBounds([[4.4, 115.2], [20.6, 126.7]], { padding: [20, 20] })

    mapRef.current = map
    // Expose map on DOM element for parent controls
    el.__leaflet_map = map

    return () => {
      map.remove()
      mapRef.current = null
      el.__leaflet_map = null
    }
  }, [])

  // Update markers + zones
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => { try { map.removeLayer(m) } catch {} })
    markersRef.current = []
    circlesRef.current.forEach((c) => { try { map.removeLayer(c) } catch {} })
    circlesRef.current = []

    riskZones.forEach((zone) => {
      const lng = Number(zone.lng)
      const lat = Number(zone.lat)
      if (!validCoord(lng, lat)) return
      const high = zone.risk_level === 'critical' || zone.risk_level === 'high'
      try {
        const circle = L.circle([lat, lng], {
          radius: 80000,
          color: high ? '#F59E0B' : '#EAB308',
          fillColor: high ? '#F59E0B' : '#FCD116',
          fillOpacity: 0.15,
          weight: 1.5,
          opacity: 0.5,
        }).addTo(map)
        circle.bindTooltip(`${zone.province} — ${zone.risk_level}`, { direction: 'top' })
        circlesRef.current.push(circle)
      } catch {}
    })

    reports.forEach((report) => {
      const lng = Number(report.lng)
      const lat = Number(report.lat)
      if (!validCoord(lng, lat)) return
      try {
        const color = statusColor[report.status] || '#F59E0B'
        const size = report.severity >= 70 ? 18 : report.severity >= 40 ? 14 : 11
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,.35);cursor:pointer;transition:transform .15s" onmouseenter="this.style.transform='scale(1.3)'" onmouseleave="this.style.transform='scale(1)'"></div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
        const marker = L.marker([lat, lng], { icon })
          .bindTooltip(`${report.lgu || 'Outage'} — ${report.status} · severity ${report.severity}/100`, { direction: 'top' })
          .addTo(map)
        marker.on('click', () => onSelectReport?.(report))
        markersRef.current.push(marker)
      } catch {}
    })
  }, [reports, riskZones])

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%' }} />
}
