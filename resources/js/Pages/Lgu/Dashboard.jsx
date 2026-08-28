import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Zap, FileText, Clock, CheckCircle2, AlertTriangle, X, ChevronRight } from 'lucide-react'

export default function LguDashboard({ lgu, reports, permits, stats, isHead }) {
  const [tab, setTab] = useState('reports')
  const [statusFilter, setStatusFilter] = useState('all')
  const [notes, setNotes] = useState({})
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [recommendModal, setRecommendModal] = useState(null)
  const [recommendNote, setRecommendNote] = useState('')

  const filtered = reports.data.filter((r) => statusFilter === 'all' || r.status === statusFilter)

  const act = (report, action, extra = {}) =>
    router.post(`/lgu/reports/${report.id}/${action}`, extra)

  const recommendPermit = (id, decision) => {
    router.post(`/lgu/permits/${id}/recommend`, { decision, decision_note: recommendNote }, {
      preserveScroll: true,
      onSuccess: () => { setRecommendModal(null); setRecommendNote('') },
    })
  }

  const approvePermit = (id) => {
    if (!confirm('Approve this permit?')) return
    router.post(`/lgu/permits/${id}/approve`, {}, { preserveScroll: true })
  }

  const rejectPermit = (id) => {
    if (!rejectNote) return
    router.post(`/lgu/permits/${id}/reject`, { decision_note: rejectNote }, {
      preserveScroll: true,
      onSuccess: () => { setRejectModal(null); setRejectNote('') },
    })
  }

  const statusColor = (s) => {
    if (s === 'resolved') return 'bg-emerald-50 text-emerald-700'
    if (s === 'verified') return 'bg-red-50 text-red-700'
    if (s === 'approved') return 'bg-emerald-50 text-emerald-700'
    if (s === 'rejected') return 'bg-red-50 text-red-700'
    if (s === 'recommended_for_approval') return 'bg-blue-50 text-blue-700'
    if (s === 'recommended_for_rejection') return 'bg-orange-50 text-orange-700'
    if (s === 'in_review') return 'bg-indigo-50 text-indigo-700'
    return 'bg-amber-50 text-amber-700'
  }

  const statusLabel = (s) => {
    const labels = {
      pending: 'Pending',
      verified: 'Verified',
      resolved: 'Resolved',
      submitted: 'Submitted',
      in_review: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
      recommended_for_approval: 'For Approval',
      recommended_for_rejection: 'For Rejection',
    }
    return labels[s] || s
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-textprimary md:text-xl">{lgu?.name}</h1>
        <p className="mt-0.5 text-xs text-textmuted md:text-sm">{lgu?.province}, {lgu?.region}</p>
      </div>

      {/* Stats — simple, clear */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <StatCard icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} label="Hindi pa na-verify" value={stats.pending} bg="bg-amber-50" />
        <StatCard icon={<Zap className="h-4 w-4 text-red-600" />} label="Na-verify na" value={stats.verified} bg="bg-red-50" />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} label="Na-resolba (7 araw)" value={stats.resolved} bg="bg-emerald-50" />
        <StatCard icon={<Clock className="h-4 w-4 text-blue-600" />} label="Avg. oras ng response" value={`${stats.avg_response_hours}h`} bg="bg-blue-50" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        <button onClick={() => setTab('reports')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition sm:text-sm ${
            tab === 'reports' ? 'border-primary text-primary' : 'border-transparent text-textmuted hover:text-textprimary'
          }`}>
          <Zap className="h-3.5 w-3.5" />
          Brownout Reports
          {stats.pending > 0 && <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{stats.pending}</span>}
        </button>
        <button onClick={() => setTab('permits')}
          className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-medium transition sm:text-sm ${
            tab === 'permits' ? 'border-primary text-primary' : 'border-transparent text-textmuted hover:text-textprimary'
          }`}>
          <FileText className="h-3.5 w-3.5" />
          Permits
        </button>
      </div>

      {/* ── Tab: Reports ── */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {['all', 'pending', 'verified', 'resolved'].map((f) => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium transition sm:text-xs ${
                  statusFilter === f ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-textmuted hover:bg-gray-50'
                }`}>
                {f === 'all' ? 'Lahat' : f === 'pending' ? 'Hintay' : f === 'verified' ? 'Na-verify' : 'Na-resolba'}
              </button>
            ))}
          </div>

          {/* Report list */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-12 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-textmuted">Walang reports</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-100 bg-white px-4 py-3 transition hover:bg-gray-50/50 sm:px-5 sm:py-3.5">
                  {/* Top: status + type */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${statusColor(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                      <span className="text-[11px] font-medium text-textprimary truncate sm:text-xs">
                        {r.outage_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-[9px] text-textmuted sm:text-[10px]">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>

                  {/* Description */}
                  {r.description && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-textmuted line-clamp-2 sm:text-xs">{r.description}</p>
                  )}

                  {/* Meta */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[9px] text-textmuted sm:text-[10px]">
                    <span>Reporter: {r.reporter?.name ?? '—'}</span>
                    <span>Severity: {r.ai_severity_score}/100</span>
                  </div>

                  {/* Actions */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    {r.status === 'pending' && (
                      <button onClick={() => act(r, 'verify')}
                        className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-primary/90 sm:text-xs">
                        I-verify
                      </button>
                    )}
                    {r.status === 'verified' && (
                      <>
                        <input type="text" placeholder="Dispatch notes..." value={notes[r.id] ?? ''}
                          onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 sm:text-xs" />
                        <button onClick={() => act(r, 'dispatch', { dispatch_notes: notes[r.id] ?? '' })} disabled={!notes[r.id]}
                          className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-white disabled:opacity-50 sm:text-xs">
                          Dispatch
                        </button>
                      </>
                    )}
                    {r.status !== 'resolved' && (
                      <button onClick={() => act(r, 'resolve')}
                        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-emerald-600 sm:text-xs">
                        Na-resolba na
                      </button>
                    )}
                    <a href={`/reports/${r.id}`}
                      className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-medium text-textmuted transition hover:bg-gray-50 sm:text-xs">
                      Details <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {reports.last_page > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-textmuted sm:text-xs">Page {reports.current_page}/{reports.last_page}</span>
              <nav className="flex gap-1">
                {reports.links.filter(l => l.url).map((l, i) => (
                  <a key={i} href={l.url}
                    className={`min-w-[28px] rounded-lg px-2 py-1 text-center text-xs transition ${
                      l.active ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: l.label }} />
                ))}
              </nav>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Permits ── */}
      {tab === 'permits' && (
        <div className="space-y-2">
          {!isHead && (
            <div className="rounded-lg bg-primary/5 px-3 py-2 text-[10px] text-primary sm:text-xs">
              Bilang Staff, maaari ka lang mag-recommend. Ang LGU Administrator ang magfa-final approve.
            </div>
          )}
          {isHead && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] text-emerald-700 sm:text-xs">
              Bilang Admin, ikaw ang magfa-final approve o reject ng mga permits.
            </div>
          )}

          {permits.data.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white px-4 py-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-300" />
              <p className="mt-2 text-sm text-textmuted">Walang permit applications</p>
            </div>
          ) : (
            permits.data.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 bg-white px-4 py-3 transition hover:bg-gray-50/50 sm:px-5 sm:py-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${statusColor(p.status)}`}>
                        {statusLabel(p.status)}
                      </span>
                      <span className="text-[11px] font-medium text-textprimary capitalize sm:text-xs">
                        {p.permit_type?.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="mt-1 text-[10px] text-textmuted sm:text-xs">
                      {p.applicant} · {p.submitted_at}
                    </div>
                    {p.ai_compliance_score > 0 && (
                      <div className="mt-0.5 text-[10px] text-textmuted sm:text-xs">AI Score: {p.ai_compliance_score}/100</div>
                    )}
                    {p.decision_note && (
                      <div className="mt-0.5 text-[10px] italic text-textmuted sm:text-xs">Note: {p.decision_note}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!isHead && (p.status === 'submitted' || p.status === 'in_review') && (
                      <>
                        <button onClick={() => setRecommendModal({ ...p, _decision: 'recommended_for_approval' })}
                          className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-emerald-600 sm:px-2.5 sm:text-[11px]">
                          Recommend
                        </button>
                        <button onClick={() => setRecommendModal({ ...p, _decision: 'recommended_for_rejection' })}
                          className="rounded-md bg-orange-500 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-orange-600 sm:px-2.5 sm:text-[11px]">
                          Reject
                        </button>
                      </>
                    )}
                    {isHead && p.status === 'recommended_for_approval' && (
                      <button onClick={() => approvePermit(p.id)}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-emerald-700 sm:px-2.5 sm:text-[11px]">
                        Approve
                      </button>
                    )}
                    {isHead && p.status === 'recommended_for_rejection' && (
                      <button onClick={() => setRejectModal(p)}
                        className="rounded-md bg-red-500 px-2 py-1 text-[10px] font-medium text-white transition hover:bg-red-600 sm:px-2.5 sm:text-[11px]">
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {permits.last_page > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-textmuted">Page {permits.current_page}/{permits.last_page}</span>
              <nav className="flex gap-1">
                {permits.links.filter(l => l.url).map((l, i) => (
                  <a key={i} href={l.url}
                    className={`min-w-[28px] rounded-lg px-2 py-1 text-center text-xs transition ${
                      l.active ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: l.label }} />
                ))}
              </nav>
            </div>
          )}
        </div>
      )}

      {/* Recommend Modal */}
      {recommendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={() => { setRecommendModal(null); setRecommendNote('') }}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textprimary">
                {recommendModal._decision === 'recommended_for_approval' ? 'I-recommend para ma-approve' : 'I-recommend na i-reject'}
              </h3>
              <button onClick={() => { setRecommendModal(null); setRecommendNote('') }} className="rounded-lg p-1 text-textmuted transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-textmuted">
              {recommendModal._decision === 'recommended_for_approval'
                ? 'Ipe-send sa LGU Administrator para sa final approval.'
                : 'Ipe-send sa LGU Administrator para sa final decision.'}
            </p>
            <textarea rows={3} placeholder="Note (optional)..." value={recommendNote}
              onChange={(e) => setRecommendNote(e.target.value)}
              className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20 resize-none" />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { setRecommendModal(null); setRecommendNote('') }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-textmuted transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => recommendPermit(recommendModal.id, recommendModal._decision)}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                  recommendModal._decision === 'recommended_for_approval' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={() => setRejectModal(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textprimary">I-reject ang permit</h3>
              <button onClick={() => { setRejectModal(null); setRejectNote('') }} className="rounded-lg p-1 text-textmuted transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-textmuted">Lagyan ng dahilan ang rejection.</p>
            <textarea rows={3} placeholder="Dahilan..." value={rejectNote}
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
    </div>
  )
}

function StatCard({ icon, label, value, bg }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>{icon}</span>
        <span className="text-[10px] font-medium text-textmuted sm:text-xs">{label}</span>
      </div>
      <div className="mt-2 text-xl font-bold tabular-nums text-textprimary sm:text-2xl">{value}</div>
    </div>
  )
}
