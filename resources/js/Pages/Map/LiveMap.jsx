import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { RefreshCw, Radio, Zap, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react'
import MapView from '../../Components/MapView'

export default function LiveMap() {
  const [data, setData] = useState({ reports: [], risk_zones: [] })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      setData(await (await fetch('/api/public/map')).json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])

  const active = data.reports.filter((r) => r.status !== 'resolved').length
  const resolved = data.reports.filter((r) => r.status === 'resolved').length

  return (
    <div
      className="relative -my-6 -mb-24 h-[calc(100dvh-4rem-1px)] overflow-hidden md:-my-8 md:-mb-12"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
    >
      <MapView reports={data.reports} riskZones={data.risk_zones} onSelectReport={setSelected} />

      {/* Top bar — floating glass panel */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 md:p-5">
        <div className="pointer-events-auto rounded-xl border border-brandborder bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-textprimary">National Outage Map</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              <Radio className={`h-3 w-3 ${loading ? 'animate-pulse' : ''}`} /> LIVE
            </span>
          </div>
          <p className="mt-0.5 text-xs text-textmuted">Republic of the Philippines · auto-refreshes every 60s</p>
        </div>

        {/* Legend */}
        <div className="pointer-events-auto hidden rounded-xl border border-brandborder bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:block">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-textmuted">Legend</h2>
          <ul className="mt-2 space-y-1.5 text-xs text-textprimary">
            <Legend color="#CE1126" label="Verified outage" />
            <Legend color="#F59E0B" label="Pending report" />
            <Legend color="#10B981" label="Resolved" />
            <Legend color="#FCD116" label="AI risk zone (48h)" ring />
          </ul>
        </div>
      </div>

      {/* Stats strip — bottom-left */}
      <div className="absolute bottom-4 left-4 z-10 flex gap-2 md:bottom-5 md:left-5">
        <Stat icon={<Zap className="h-3.5 w-3.5 text-danger" />} value={active} label="Active" />
        <Stat icon={<CheckCircle2 className="h-3.5 w-3.5 text-success" />} value={resolved} label="Resolved" />
        <Stat icon={<AlertTriangle className="h-3.5 w-3.5 text-warning" />} value={data.risk_zones.length} label="Risk zones" />
      </div>

      {/* Refresh — bottom-right above zoom controls */}
      <button onClick={load}
        className="absolute right-4 top-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-brandborder bg-white/90 shadow-lg backdrop-blur-md transition hover:bg-tint md:right-5"
        aria-label="Refresh map data">
        <RefreshCw className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
      </button>

      {/* Selected report card */}
      {selected && (
        <div className="absolute bottom-16 left-4 z-20 w-[min(92vw,340px)] rounded-xl border border-brandborder bg-white/95 p-4 shadow-xl backdrop-blur-md md:bottom-5 md:left-1/2 md:-translate-x-1/2">
          <button onClick={() => setSelected(null)} aria-label="Close"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-textmuted hover:bg-muted">×</button>
          <div className="flex items-center gap-2 pr-6">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
              selected.status === 'verified' ? 'bg-danger/10 text-red-700' : selected.status === 'resolved' ? 'bg-success/10 text-emerald-700' : 'bg-warning/15 text-yellow-800'}`}>
              {selected.status}
            </span>
            <span className="text-sm font-semibold">Report #{selected.id}</span>
          </div>
          <p className="mt-1.5 text-xs text-textmuted">
            {selected.lgu ?? 'Philippines'} · {selected.outage_type.replace(/_/g, ' ')} · severity {selected.severity}/100
          </p>
          <Link href={`/reports/${selected.id}`} className="mt-3 inline-flex h-9 items-center rounded-lg bg-primary px-3.5 text-xs font-medium text-white transition hover:bg-primary/90">
            View details
          </Link>
        </div>
      )}
    </div>
  )
}

function Legend({ color, label, ring = false }) {
  return (
    <li className="flex items-center gap-2">
      {ring ? (
        <span className="h-3 w-3 inline-block rounded-full opacity-40" style={{ background: color, boxShadow: `inset 0 0 0 1.5px ${color}` }} />
      ) : (
        <span className="h-2.5 w-2.5 inline-block rounded-full" style={{ background: color }} />
      )}
      {label}
    </li>
  )
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex min-h-[44px] items-center gap-2 rounded-xl border border-brandborder bg-white/90 px-3 py-2 shadow-lg backdrop-blur-md">
      {icon}
      <span className="text-sm font-bold">{value}</span>
      <span className="text-xs text-textmuted">{label}</span>
    </div>
  )
}
