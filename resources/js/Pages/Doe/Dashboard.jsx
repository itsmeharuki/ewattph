import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Activity, FileText, Megaphone, Users, CheckCircle, XCircle, X, Plus, MapPin } from 'lucide-react'

export default function DoeDashboard({ metrics, permits, advisories, staffActivity, isHead }) {
  const [showAdvisoryModal, setShowAdvisoryModal] = useState(false)
  const [advisoryForm, setAdvisoryForm] = useState({ title: '', body: '', severity: 'info' })
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote] = useState('')

  const approvePermit = (id) => {
    if (!confirm('Approve this permit?')) return
    router.post(`/doe/permits/${id}/approve`, {}, { preserveScroll: true })
  }

  const rejectPermit = (id) => {
    if (!rejectNote) return
    router.post(`/doe/permits/${id}/reject`, { decision_note: rejectNote }, {
      preserveScroll: true,
      onSuccess: () => { setRejectModal(null); setRejectNote('') },
    })
  }

  const submitAdvisory = () => {
    if (!advisoryForm.title || !advisoryForm.body) return
    router.post('/doe/advisories', advisoryForm, {
      preserveScroll: true,
      onSuccess: () => { setShowAdvisoryModal(false); setAdvisoryForm({ title: '', body: '', severity: 'info' }) },
    })
  }

  const permitStatusColor = (s) => {
    if (s === 'approved') return 'bg-emerald-50 text-emerald-700'
    if (s === 'rejected') return 'bg-red-50 text-red-700'
    if (s === 'in_review') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  const severityColor = (s) => {
    if (s === 'critical') return 'bg-red-50 text-red-700 border-red-200'
    if (s === 'warning') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-blue-50 text-blue-700 border-blue-200'
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-textprimary">Department of Energy</h1>
        <p className="mt-0.5 text-sm text-textmuted">National energy monitoring and permit processing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Power Reliability', value: `${metrics.power_reliability}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Incidents', value: metrics.active_outages, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Resolved Today', value: metrics.resolved_today, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Reports (24h)', value: metrics.reports_24h, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
                <Activity className={`h-3.5 w-3.5 ${color}`} />
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-textmuted">{label}</span>
            </div>
            <div className={`mt-2 text-2xl font-bold tabular-nums ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-5">
          {/* Permits */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-textprimary">Permit Applications</h2>
              </div>
              <span className="text-xs text-textmuted">{permits.total} total</span>
            </div>
            <div className="p-5">
              {permits.data.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No permit applications.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {permits.data.map((p) => (
                      <div key={p.id} className="rounded-lg border border-gray-100 px-4 py-3 transition hover:bg-gray-50">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-textprimary capitalize">{p.permit_type?.replace(/_/g, ' ')}</span>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${permitStatusColor(p.status)}`}>
                                {p.status?.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-textmuted">
                              {p.applicant} &middot; {p.submitted_at}
                            </div>
                            {p.ai_compliance_score > 0 && (
                              <div className="mt-1 text-xs text-textmuted">AI Score: {p.ai_compliance_score}/100</div>
                            )}
                          </div>
                          {p.status === 'submitted' || p.status === 'in_review' ? (
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => approvePermit(p.id)}
                                className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600">
                                Approve
                              </button>
                              <button onClick={() => setRejectModal(p)}
                                className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600">
                                Reject
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  {permits.last_page > 1 && (
                    <nav className="mt-4 flex justify-center gap-1">
                      {permits.links.filter(l => l.url).map((l, i) => (
                        <a key={i} href={l.url}
                          className={`min-w-[32px] rounded-lg px-2.5 py-1 text-center text-sm transition ${
                            l.active ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
                          }`}
                          dangerouslySetInnerHTML={{ __html: l.label }} />
                      ))}
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-textprimary">Quick Links</h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/monitoring" className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-textprimary transition hover:bg-gray-100">Monitoring</a>
              <a href="/map" className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-textprimary transition hover:bg-gray-100">Live Map</a>
              <a href="/permits/tracker" className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-textprimary transition hover:bg-gray-100">Public Permit Tracker</a>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Advisories */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-textprimary">Advisories</h2>
              </div>
              <button onClick={() => setShowAdvisoryModal(true)}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white transition hover:bg-primary/90">
                <Plus className="h-3 w-3" /> New
              </button>
            </div>
            <div className="p-5">
              {advisories.data.length === 0 ? (
                <p className="py-6 text-center text-sm text-textmuted">No advisories.</p>
              ) : (
                <div className="space-y-2">
                  {advisories.data.map((a) => (
                    <div key={a.id} className="rounded-lg border border-gray-100 px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-textprimary leading-snug">{a.title}</div>
                          <div className="mt-0.5 text-xs text-textmuted">{a.created_at}</div>
                        </div>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${severityColor(a.severity)}`}>
                          {a.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Staff Activity (Head only) */}
          {isHead && staffActivity.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-sm font-semibold text-textprimary">Staff Activity</h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {staffActivity.map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition hover:bg-gray-50">
                      <div>
                        <span className="text-sm font-medium text-textprimary">{log.user}</span>
                        <span className="ml-1.5 text-xs text-textmuted">{log.action}</span>
                      </div>
                      <span className="text-xs text-textmuted">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Permit Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setRejectModal(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textprimary">Reject Permit</h3>
              <button onClick={() => { setRejectModal(null); setRejectNote('') }} className="rounded-lg p-1 text-textmuted transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-textmuted">Provide a reason for rejection.</p>
            <textarea rows={3} placeholder="Reason for rejection..." value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRejectModal(null); setRejectNote('') }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-textmuted transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => rejectPermit(rejectModal.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Advisory Modal */}
      {showAdvisoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowAdvisoryModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textprimary">New Advisory</h3>
              <button onClick={() => setShowAdvisoryModal(false)} className="rounded-lg p-1 text-textmuted transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-textmuted">Title</label>
                <input type="text" placeholder="e.g. Load Shedding Schedule" value={advisoryForm.title}
                  onChange={(e) => setAdvisoryForm({ ...advisoryForm, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-textmuted">Body</label>
                <textarea rows={4} placeholder="Advisory details..." value={advisoryForm.body}
                  onChange={(e) => setAdvisoryForm({ ...advisoryForm, body: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-textmuted">Severity</label>
                <div className="flex gap-2">
                  {['info', 'warning', 'critical'].map((s) => (
                    <button key={s} onClick={() => setAdvisoryForm({ ...advisoryForm, severity: s })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                        advisoryForm.severity === s ? severityColor(s) + ' border-2' : 'border-gray-200 text-textmuted hover:bg-gray-50'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowAdvisoryModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-textmuted transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={submitAdvisory}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">
                Publish Advisory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
