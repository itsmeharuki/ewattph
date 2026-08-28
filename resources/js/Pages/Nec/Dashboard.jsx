import { useState } from 'react'
import { router } from '@inertiajs/react'
import { AlertTriangle, Activity, MapPin, Building2, Megaphone, X, Radar } from 'lucide-react'

export default function NecDashboard({ metrics, announcements, riskZones, autoDetected, agencyStatus, emergencyActive }) {
  const [showDeclareModal, setShowDeclareModal] = useState(false)
  const [expandedAdvisory, setExpandedAdvisory] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', severity: 'high' })
  const [incidentPage, setIncidentPage] = useState(1)
  const [advisoryPage, setAdvisoryPage] = useState(1)

  const declareEmergency = () => {
    if (!form.title || !form.description) return
    router.post('/nec/declare-emergency', form, {
      preserveScroll: true,
      onSuccess: () => { setShowDeclareModal(false); setForm({ title: '', description: '', severity: 'high' }) },
    })
  }

  const deactivateEmergency = () => {
    if (!confirm('Deactivate the current emergency declaration?')) return
    router.post('/nec/deactivate-emergency', {}, { preserveScroll: true })
  }

  const severityColor = (s) => {
    if (s === 'critical') return 'bg-red-50 text-red-700 border-red-200'
    if (s === 'high') return 'bg-orange-50 text-orange-700 border-orange-200'
    if (s === 'medium') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-gray-50 text-gray-700 border-gray-200'
  }

  const riskColor = (level) => {
    if (!level) return 'bg-gray-100 text-gray-600'
    const l = level.toLowerCase()
    if (l === 'high') return 'bg-red-50 text-red-700'
    if (l === 'medium') return 'bg-amber-50 text-amber-700'
    if (l === 'low') return 'bg-emerald-50 text-emerald-700'
    return 'bg-gray-100 text-gray-600'
  }

  const incidentData = autoDetected?.data ?? autoDetected ?? []
  const incidentTotal = autoDetected?.last_page ?? 1
  const advisoryData = announcements?.data ?? announcements ?? []
  const advisoryTotal = announcements?.last_page ?? 1

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header — stacks on mobile */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg font-bold text-textprimary md:text-xl">National Emergency Council</h1>
          <p className="mt-0.5 text-xs text-textmuted md:text-sm">Real-time national energy situational awareness</p>
        </div>
        <div className="shrink-0">
          {emergencyActive ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 sm:px-3 sm:text-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Emergency Active
              </span>
              <button onClick={deactivateEmergency}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-textmuted transition hover:bg-gray-50 sm:text-sm">
                Deactivate
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDeclareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700 sm:px-4 sm:text-sm">
              <AlertTriangle className="h-4 w-4" /> Declare Emergency
            </button>
          )}
        </div>
      </div>

      {/* Stat cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {[
          { label: 'Power Reliability', value: `${metrics.power_reliability}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Incidents', value: metrics.active_outages, color: 'text-red-600', bg: 'bg-red-50', sub: `${metrics.citizen_reports}r · ${metrics.auto_detected}s` },
          { label: 'Resolved Today', value: metrics.resolved_today, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Reports (24h)', value: metrics.reports_24h, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg, sub }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-lg sm:h-7 sm:w-7 ${bg}`}>
                <Radar className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${color}`} />
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-textmuted sm:text-xs">{label}</span>
            </div>
            <div className={`mt-1.5 text-xl font-bold tabular-nums sm:mt-2 sm:text-2xl ${color}`}>{value}</div>
            {sub && <div className="mt-0.5 text-[10px] text-textmuted sm:text-xs">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Content grid — single column on mobile, 3-col on desktop */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
        {/* Left — main content */}
        <div className="space-y-4 md:col-span-2 md:space-y-5">
          {/* Risk Assessment */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <h2 className="text-xs font-semibold text-textprimary sm:text-sm">National Risk Assessment</h2>
              </div>
              <span className="text-[10px] text-textmuted sm:text-xs">{riskZones.length} zones</span>
            </div>
            <div className="p-4 sm:p-5">
              {riskZones.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No risk data available.</p>
              ) : (
                <div className="space-y-1">
                  {riskZones.map((z, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition hover:bg-gray-50 sm:px-3 sm:py-2.5">
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-textprimary sm:text-sm">{z.province || z.region || 'Unknown'}</span>
                        <span className="ml-1.5 text-[10px] text-textmuted sm:text-xs">{z.predicted_cause || z.cause || ''}</span>
                      </div>
                      <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs ${riskColor(z.risk_level || z.level)}`}>
                        {(z.risk_level || z.level || 'unknown').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid Incident Feed — paginated */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <h2 className="text-xs font-semibold text-textprimary sm:text-sm">Grid Incident Feed</h2>
              </div>
              <span className="text-[10px] text-textmuted sm:text-xs">{autoDetected?.total ?? incidentData.length} total</span>
            </div>
            <div className="p-4 sm:p-5">
              {incidentData.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No incidents detected.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {incidentData.map((d) => (
                      <div key={d.id} className="rounded-lg border border-gray-100 px-3 py-2.5 transition hover:bg-gray-50 sm:px-4 sm:py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-textprimary sm:text-sm">{d.province}</span>
                          <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 sm:px-2 sm:text-xs">{d.confidence}%</span>
                          {d.outage_type && <span className="text-[10px] text-textmuted sm:text-xs">{d.outage_type}</span>}
                        </div>
                        <p className="mt-1 text-xs text-textmuted line-clamp-1 sm:text-sm">{d.summary}</p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-textmuted sm:text-xs">
                          <span>{d.source_label}</span>
                          <span>&middot;</span>
                          <span>{d.detected_at}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {incidentTotal > 1 && (
                    <PaginationNav page={incidentPage} total={incidentTotal} onChange={setIncidentPage} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right column — single column on mobile */}
        <div className="space-y-4 md:space-y-5">
          {/* Advisories — paginated */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-500" />
                <h2 className="text-xs font-semibold text-textprimary sm:text-sm">Advisories</h2>
              </div>
              <span className="text-[10px] text-textmuted sm:text-xs">{announcements?.total ?? advisoryData.length} total</span>
            </div>
            <div className="p-4 sm:p-5">
              {advisoryData.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No advisories.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {advisoryData.map((a) => {
                      const expanded = expandedAdvisory === a.id
                      return (
                        <div key={a.id} className="rounded-lg border border-gray-100 px-3 py-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-textprimary leading-snug sm:text-sm">{a.title}</div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-textmuted sm:text-xs">
                                <span className="font-medium">{a.source}</span>
                                <span>&middot;</span>
                                <span>{a.published_at}</span>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${severityColor(a.severity)}`}>
                              {a.severity}
                            </span>
                          </div>
                          {a.body && (
                            <div className="mt-2">
                              <p className={`text-xs text-textmuted leading-relaxed sm:text-sm ${expanded ? '' : 'line-clamp-2'}`}>{a.body}</p>
                              {a.body.length > 80 && (
                                <button onClick={() => setExpandedAdvisory(expanded ? null : a.id)}
                                  className="mt-1 text-[11px] font-medium text-primary hover:underline sm:text-xs">
                                  {expanded ? 'Isara' : 'Basahin pa'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {advisoryTotal > 1 && (
                    <PaginationNav page={advisoryPage} total={advisoryTotal} onChange={setAdvisoryPage} />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Agency Status */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                <h2 className="text-xs font-semibold text-textprimary sm:text-sm">Agency Coordination</h2>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="space-y-1">
                {agencyStatus.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition hover:bg-gray-50 sm:px-3 sm:py-2.5">
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-textprimary sm:text-sm">{a.abbreviation}</span>
                      <span className="ml-1 text-[10px] text-textmuted sm:text-xs">{a.name}</span>
                    </div>
                    <div className="shrink-0 text-right text-[10px] text-textmuted sm:text-xs">
                      <span>{a.staff_count} staff</span>
                      {a.permits_pending > 0 && <span className="ml-1 text-amber-600 font-medium">{a.permits_pending} pending</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Declare Emergency Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={() => setShowDeclareModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl md:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textprimary">Declare State of Emergency</h3>
              <button onClick={() => setShowDeclareModal(false)} className="rounded-lg p-1 text-textmuted transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-textmuted">This will activate national emergency response protocols.</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-textmuted">Title</label>
                <input type="text" placeholder="e.g. Widespread Luzon Brownout" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-textmuted">Description</label>
                <textarea rows={3} placeholder="Describe the situation..." value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-textmuted">Severity</label>
                <div className="flex gap-2">
                  {['critical', 'high', 'medium'].map((s) => (
                    <button key={s} onClick={() => setForm({ ...form, severity: s })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition sm:text-sm ${
                        form.severity === s ? severityColor(s) + ' border-2' : 'border-gray-200 text-textmuted hover:bg-gray-50'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowDeclareModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-textmuted transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={declareEmergency}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
                Declare Emergency
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PaginationNav({ page, total, onChange }) {
  if (total <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`min-w-[28px] rounded-lg px-2 py-1 text-xs transition sm:min-w-[32px] sm:px-2.5 sm:py-1 sm:text-sm ${
            p === page ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
          }`}>
          {p}
        </button>
      ))}
    </div>
  )
}
