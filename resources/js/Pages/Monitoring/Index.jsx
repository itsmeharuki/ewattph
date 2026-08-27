import { useState, useRef, useCallback, useEffect } from 'react'
import { Link, router } from '@inertiajs/react'
import { Zap, MapPin, ShieldCheck, AlertTriangle, Megaphone, Clock, ExternalLink, Eye, Radio } from 'lucide-react'
import Reveal from '../../Components/Reveal'
import LocationPicker from '../../Components/LocationPicker'

/**
 * Public monitoring — ultra-simple dashboard.
 * Users should understand the page in 2 seconds.
 */
const PER_PAGE = 3

export default function MonitoringIndex({ metrics = {}, announcements = [], riskZones = [], autoDetected = [], selectedLgu = null }) {
  const [tab, setTab] = useState('all')
  const [advisoryPage, setAdvisoryPage] = useState(0)
  const [autoPage, setAutoPage] = useState(0)
  const [expanded, setExpanded] = useState({})

  const show = (key) => tab === 'all' || tab === key

  const advisoryTotal = Math.ceil(announcements.length / PER_PAGE)
  const autoTotal = Math.ceil(autoDetected.length / PER_PAGE)
  const pagedAdvisories = announcements.slice(advisoryPage * PER_PAGE, advisoryPage * PER_PAGE + PER_PAGE)

  const tabs = [
    { key: 'all', label: 'Lahat' },
    { key: 'status', label: 'Power' },
    { key: 'risks', label: 'Alerts' },
    { key: 'advisories', label: 'Advisory' },
  ]

  const handleLocationChange = (lgu) => {
    router.get('/monitoring', lgu ? { lgu_id: lgu.id } : {}, { preserveState: true, preserveScroll: true })
  }

  return (
    <div className="relative min-h-screen">
      {/* Decorative glow — full page */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="relative px-4 pt-6 pb-2">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-textprimary leading-tight">
                {selectedLgu ? selectedLgu.name : 'Buong Pilipinas'}
              </h1>
              <p className="text-sm text-textmuted mt-1 leading-relaxed">
                {selectedLgu ? `${selectedLgu.province} · ${selectedLgu.region}` : 'Power Status'}
              </p>
            </div>
            <LocationPicker value={selectedLgu} onChange={handleLocationChange} compact />
          </div>
          {/* Tabs */}
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {tabs.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  tab === key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-textmuted hover:bg-gray-200'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-3xl px-4 pt-4 pb-8 space-y-5">

        {/* ═══ POWER STATUS ═════════════════════════════════════ */}
        {show('status') && (
          <Reveal>
            <div className="bg-white rounded-lg border border-gray-200 p-5">
              <p className="text-3xl font-bold text-textprimary leading-tight">
                {metrics.power_reliability ?? '–'}%
              </p>
              <p className="text-sm text-textmuted mt-2 leading-relaxed">ang may kuryente ngayon</p>
              <div className="mt-4 flex items-center gap-5 text-sm text-textmuted leading-relaxed">
                <span>{metrics.active_outages ?? 0} brownout</span>
                <span className="text-slate-300">·</span>
                <span>{metrics.reports_24h ?? 0} reports</span>
              </div>
              <Link href={`/reports/create${selectedLgu ? `?lgu_id=${selectedLgu.id}` : ''}`}
                className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90">
                <Zap className="h-4 w-4" /> Mag-report
              </Link>
            </div>
          </Reveal>
        )}

        {/* ═══ RISK ALERTS ══════════════════════════════════════ */}
        {show('risks') && (
          <Reveal>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-textprimary leading-relaxed">Risk Alerts</h2>
              </div>
              {riskZones.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-textmuted">
                  Walang alerts
                </div>
              ) : (
                <RiskCarousel zones={riskZones} />
              )}
            </div>
          </Reveal>
        )}

        {/* ═══ GRID INCIDENT FEED ════════════════════════════════ */}
        {show('advisories') && autoDetected.length > 0 && (
          <Reveal>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-textprimary leading-relaxed">Grid Incident Feed</h2>
                <span className="ml-auto text-[10px] text-slate-400 font-medium">{autoDetected.length} reports</span>
              </div>
              <div className="divide-y divide-gray-100">
                {autoDetected.slice(autoPage * PER_PAGE, autoPage * PER_PAGE + PER_PAGE).map((d) => (
                  <AutoDetectedItem key={d.id} item={d} />
                ))}
              </div>
              {autoTotal > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <button onClick={() => setAutoPage(Math.max(0, autoPage - 1))} disabled={autoPage === 0}
                    className="text-xs font-medium text-primary disabled:text-slate-300">← Previous</button>
                  <span className="text-[11px] text-slate-400">{autoPage + 1} / {autoTotal}</span>
                  <button onClick={() => setAutoPage(Math.min(autoTotal - 1, autoPage + 1))} disabled={autoPage >= autoTotal - 1}
                    className="text-xs font-medium text-primary disabled:text-slate-300">Next →</button>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* ═══ ANNOUNCEMENTS ════════════════════════════════════ */}
        {show('advisories') && (
          <Reveal>
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-textprimary leading-relaxed">Advisories</h2>
              </div>
              {announcements.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-textmuted">
                  Walang announcements
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100">
                    {pagedAdvisories.map((a) => {
                      const isOpen = expanded[a.id]
                      return (
                        <div key={a.id} className="px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary text-[10px] font-bold">
                              {a.source?.slice(0, 3)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-textprimary truncate leading-relaxed">{a.title}</p>
                              <p className={`text-xs text-textmuted mt-1.5 leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>{a.body}</p>
                              {a.body && a.body.length > 80 && (
                                <button onClick={() => setExpanded(prev => ({ ...prev, [a.id]: !prev[a.id] }))}
                                  className="mt-1 text-[11px] font-medium text-primary hover:underline">
                                  {isOpen ? 'Isara' : 'Basahin pa →'}
                                </button>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                                <Clock className="h-3 w-3" /> {a.published_at}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {advisoryTotal > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                      <button onClick={() => setAdvisoryPage(Math.max(0, advisoryPage - 1))} disabled={advisoryPage === 0}
                        className="text-xs font-medium text-primary disabled:text-slate-300">← Previous</button>
                      <span className="text-[11px] text-slate-400">{advisoryPage + 1} / {advisoryTotal}</span>
                      <button onClick={() => setAdvisoryPage(Math.min(advisoryTotal - 1, advisoryPage + 1))} disabled={advisoryPage >= advisoryTotal - 1}
                        className="text-xs font-medium text-primary disabled:text-slate-300">Next →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  )
}

function RiskCarousel({ zones }) {
  const scrollRef = useRef(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)

  const checkEdges = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4)
    // Determine active card
    const cardW = el.firstChild?.offsetWidth ?? 1
    setActiveIdx(Math.round(el.scrollLeft / (cardW + 12)))
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkEdges()
    el.addEventListener('scroll', checkEdges, { passive: true })
    return () => el.removeEventListener('scroll', checkEdges)
  }, [checkEdges])

  const riskStyle = (level) => {
    if (level === 'critical') return { accent: '#CE1126', bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', icon: 'text-red-500' }
    if (level === 'high') return { accent: '#EA580C', bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', icon: 'text-orange-500' }
    return { accent: '#D97706', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-500' }
  }

  return (
    <div className="relative py-3">
      {/* Left edge fade */}
      {!atStart && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
      )}
      {/* Right edge fade */}
      {!atEnd && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10 bg-gradient-to-l from-white via-white/80 to-transparent" />
      )}

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-5 pb-1" style={{ scrollbarWidth: 'none' }}>
        {zones.map((z, i) => {
          const s = riskStyle(z.risk_level)
          const isActive = i === activeIdx
          return (
            <div key={i} className={`snap-start shrink-0 w-[78%] sm:w-[62%] rounded-xl border ${s.border} ${s.bg} p-4 transition-all duration-300 ${isActive ? 'shadow-md scale-[1.02]' : 'opacity-50 scale-[0.97]'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.bg} ${s.icon}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-textprimary truncate">{z.province}</span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${s.badge}`}>
                      {z.risk_level}
                    </span>
                  </div>
                  <p className="text-xs text-textmuted mt-1.5 leading-relaxed">{z.predicted_cause}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dot indicators */}
      {zones.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {zones.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? 'w-6 bg-primary' : 'w-1.5 bg-gray-300'}`} />
          ))}
        </div>
      )}
    </div>
  )
}

function AutoDetectedItem({ item }) {
  const [open, setOpen] = useState(false)
  const d = item
  const hasLongText = (d.summary && d.summary.length > 60) || (d.raw_text && d.raw_text.length > 60)

  // Extract domain name from URL for display
  const sourceDomain = d.source_url ? (() => {
    try {
      const hostname = new URL(d.source_url).hostname.replace('www.', '')
      return hostname.charAt(0).toUpperCase() + hostname.slice(1)
    } catch { return d.source_label }
  })() : null

  const sourceBg = {
    'Facebook': 'bg-indigo-50 text-indigo-600',
    'X (Twitter)': 'bg-sky-50 text-sky-600',
    'Instagram': 'bg-pink-50 text-pink-600',
    'News Media': 'bg-emerald-50 text-emerald-600',
    'Web Search': 'bg-violet-50 text-violet-600',
    'DOE Philippines': 'bg-red-50 text-red-600',
    'NGCP': 'bg-orange-50 text-orange-600',
    'NGCP (X)': 'bg-orange-50 text-orange-600',
    'Meralco': 'bg-yellow-50 text-yellow-700',
    'PNA': 'bg-blue-50 text-blue-600',
    'DOST-PAGASA': 'bg-cyan-50 text-cyan-600',
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-[10px] font-bold ${sourceBg[d.source_label] || 'bg-blue-50 text-blue-600'}`}>
          {d.source_label?.slice(0, 2) || 'AI'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-textprimary">{d.province}</span>
            <span className="rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold uppercase">
              {d.confidence}% conf
            </span>
            {d.outage_type && (
              <span className="rounded-full bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[9px] font-medium uppercase">
                {d.outage_type}
              </span>
            )}
          </div>
          <p className={`text-xs text-textmuted mt-1.5 leading-relaxed ${!open ? 'line-clamp-2' : ''}`}>{d.summary}</p>
          {open && d.raw_text && d.raw_text !== d.summary && (
            <div className="mt-2 rounded-lg bg-slate-50 border border-slate-100 p-2.5">
              <p className="text-[11px] text-slate-500 leading-relaxed">{d.raw_text}</p>
            </div>
          )}
          {hasLongText && (
            <button onClick={() => setOpen(!open)} className="mt-1.5 text-[11px] font-medium text-primary hover:underline">
              {open ? 'Isara' : 'Basahin pa →'}
            </button>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Clock className="h-3 w-3" /> {d.detected_at}
            </div>
            {d.source_url ? (
              <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600 transition hover:bg-blue-100">
                <ExternalLink className="h-3 w-3" /> {sourceDomain || d.source_label}
              </a>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                <Radio className="h-3 w-3" /> {d.source_label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
