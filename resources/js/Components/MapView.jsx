import { useEffect, useRef, useState } from 'react'

export const PH_BOUNDS = [
  [4.4, 115.2], // SW — Mindanao/Tawi-Tawi
  [20.6, 126.7], // NE — Batanes
]

const statusColor = {
  pending: '#F59E0B',
  verified: '#CE1126',
  resolved: '#10B981',
}

/**
 * eGov-style national map: clean light CARTO Positron basemap,
 * locked to Philippine bounds, severity-scaled outage markers.
 */
export default function MapView({ reports = [], riskZones = [], onSelectReport, className = 'h-full w-full', center = [121.0437, 14.676], zoom = 5.4, lockPH = true }) {
  const container = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const zoneIdsRef = useRef([])
  const [maplibre, setMaplibre] = useState(null)

  useEffect(() => {
    let cancelled = false
    import('maplibre-gl').then((mod) => {
      if (!cancelled) setMaplibre(mod)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!maplibre || !container.current || mapRef.current) return

    const map = new maplibre.Map({
      container: container.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center,
      zoom,
      attributionControl: { compact: true },
      ...(lockPH
        ? {
            maxBounds: PH_BOUNDS,
            minZoom: 4.8,
            maxZoom: 16,
          }
        : {}),
    })
    map.addControl(new maplibre.NavigationControl({ showCompass: false }), 'bottom-right')
    if (lockPH) {
      map.on('load', () => map.fitBounds(PH_BOUNDS, { padding: 24, duration: 0 }))
    }
    mapRef.current = map

    return () => { map.remove(); mapRef.current = null; markersRef.current = []; zoneIdsRef.current = [] }
  }, [maplibre])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const render = () => {
      renderZones(map)
      renderMarkers(map)
    }

    map.on('load', render)
    if (map.isStyleLoaded()) render()

    function clearMarkers() {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      zoneIdsRef.current.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id)
        if (map.getSource(id)) map.removeSource(id)
      })
      zoneIdsRef.current = []
    }

    function renderZones(map) {
      zoneIdsRef.current.forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id)
        if (map.getSource(id)) map.removeSource(id)
      })
      zoneIdsRef.current = []

      riskZones.forEach((zone, i) => {
        const id = `risk-${i}`
        const lng = Number(zone.lng ?? 121.8)
        const lat = Number(zone.lat ?? 12.9)
        const high = zone.risk_level === 'critical' || zone.risk_level === 'high'
        map.addSource(id, { type: 'geojson', data: point(lng, lat) })
        map.addLayer({
          id,
          type: 'circle',
          source: id,
          paint: {
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 4.5, 26, 10, 90],
            'circle-color': high ? '#F59E0B' : '#FCD116',
            'circle-opacity': 0.22,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': high ? '#F59E0B' : '#EAB308',
            'circle-stroke-opacity': 0.5,
          },
        })
        zoneIdsRef.current.push(id)
      })
    }

    function renderMarkers(map) {
      clearMarkers()
      reports.forEach((report) => {
        const color = statusColor[report.status] || '#F59E0B'
        const el = document.createElement('div')
        const scale = report.severity >= 70 ? 20 : report.severity >= 40 ? 16 : 13
        el.style.cssText =
          `width:${scale}px;height:${scale}px;border-radius:9999px;background:${color};` +
          'border:2.5px solid white;box-shadow:0 1px 6px rgba(0,0,0,.35);cursor:pointer;' +
          `transition:transform .15s ease;`
        el.setAttribute('role', 'button')
        el.title = `${report.lgu || 'Outage'} — ${report.status} · severity ${report.severity}/100`
        el.addEventListener('mouseenter', () => (el.style.transform = 'scale(1.25)'))
        el.addEventListener('mouseleave', () => (el.style.transform = 'scale(1)'))
        el.addEventListener('click', () => onSelectReport?.(report))
        markersRef.current.push(new maplibre.Marker({ element: el }).setLngLat([report.lng, report.lat]).addTo(map))
      })
    }
  }, [reports, riskZones, maplibre])

  return <div ref={container} className={className} aria-label="Live national power outage map of the Philippines" />
}

function point(lng, lat) {
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] } }] }
}
