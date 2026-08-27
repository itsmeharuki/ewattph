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

  // Client-side pagination slices
  const incidentData = autoDetected?.data ?? autoDetected ?? []
  const incidentTotal = autoDetected?.last_page ?? 1
  const advisoryData = announcements?.data ?? announcements ?? []
  const advisoryTotal = announcements?.last_page ?? 1

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-textprimary">National Emergency Council</h1>
          <p className="mt-0.5 text-sm text-textmuted">Real-time national energy situational awareness</p>
        </div>
        <div>
          {emergencyActive ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Emergency Active
              </span>
              <button onClick={deactivateEmergency}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-textmuted transition hover:bg-gray-50">
                Deactivate
              </button>
            </div>
          ) : (
            <button onClick={() => setShowDeclareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
              <AlertTriangle className="h-4 w-4" /> Declare Emergency
            </button>
          )}
        </div>
      </div>

      {/* National Overview — stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Power Reliability', value: `${metrics.power_reliability}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Incidents', value: metrics.active_outages, color: 'text-red-600', bg: 'bg-red-50', sub: `${metrics.citizen_reports} reported · ${metrics.auto_detected} scraped` },
          { label: 'Resolved Today', value: metrics.resolved_today, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Reports (24h)', value: metrics.reports_24h, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg, sub }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
                <Radar className={`h-3.5 w-3.5 ${color}`} />
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-textmuted">{label}</span>
            </div>
            <div className={`mt-2 text-2xl font-bold tabular-nums ${color}`}>{value}</div>
            {sub && <div className="mt-0.5 text-xs text-textmuted">{sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Risk Assessment */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-textprimary">National Risk Assessment</h2>
              </div>
              <span className="text-xs text-textmuted">{riskZones.length} zones</span>
            </div>
            <div className="p-5">
              {riskZones.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No risk data available.</p>
              ) : (
                <div className="space-y-1.5">
                  {riskZones.map((z, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-gray-50">
                      <div>
                        <span className="text-sm font-medium text-textprimary">{z.province || z.region || 'Unknown'}</span>
                        <span className="ml-2 text-xs text-textmuted">{z.predicted_cause || z.cause || ''}</span>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${riskColor(z.risk_level || z.level)}`}>
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
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-semibold text-textprimary">Grid Incident Feed</h2>
              </div>
              <span className="text-xs text-textmuted">{autoDetected?.total ?? incidentData.length} total</span>
            </div>
            <div className="p-5">
              {incidentData.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No incidents detected.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {incidentData.map((d) => (
                      <div key={d.id} className="rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-textprimary">{d.province}</span>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">{d.confidence}%</span>
                          {d.outage_type && <span className="text-xs text-textmuted">{d.outage_type}</span>}
                        </div>
                        <p className="mt-1 text-sm text-textmuted line-clamp-1">{d.summary}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-textmuted">
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

        {/* Right column */}
        <div className="space-y-5">
          {/* Advisories — paginated */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-textprimary">Advisories</h2>
              </div>
              <span className="text-xs text-textmuted">{announcements?.total ?? advisoryData.length} total</span>
            </div>
            <div className="p-5">
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
                              <div className="text-sm font-medium text-textprimary leading-snug">{a.title}</div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-textmuted">
                                <span className="font-medium">{a.source}</span>
                                <span>&middot;</span>
                                <span>{a.published_at}</span>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${severityColor(a.severity)}`}>
                              {a.severity}
                            </span>
                          </div>
                          {a.body && (
                            <div className="mt-2">
                              <p className={`text-sm text-textmuted leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{a.body}</p>
                              {a.body.length > 80 && (
                                <button onClick={() => setExpandedAdvisory(expanded ? null : a.id)}
                                  className="mt-1 text-xs font-medium text-primary hover:underline">
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
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-textprimary">Agency Coordination</h2>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-1.5">
                {agencyStatus.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-gray-50">
                    <div>
                      <span className="text-sm font-medium text-textprimary">{a.abbreviation}</span>
                      <span className="ml-1.5 text-xs text-textmuted">{a.name}</span>
                    </div>
                    <div className="text-right text-xs text-textmuted">
                      <span>{a.staff_count} staff</span>
                      {a.permits_pending > 0 && <span className="ml-2 text-amber-600 font-medium">{a.permits_pending} pending</span>}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowDeclareModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
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

/* Simple pagination component */
function PaginationNav({ page, total, onChange }) {
  if (total <= 1) return null
  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`min-w-[32px] rounded-lg px-2.5 py-1 text-sm transition ${
            p === page ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
          }`}>
          {p}
        </button>
      ))}
    </div>
  )
}
