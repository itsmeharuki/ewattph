import { useState } from 'react'
import { router } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'

export default function LguDashboard({ lgu, reports, stats }) {
  const [filter, setFilter] = useState('all')
  const [notes, setNotes] = useState({})

  const filtered = reports.data.filter((r) => filter === 'all' || r.status === filter)

  const act = (report, action, extra = {}) =>
    router.post(`/lgu/reports/${report.id}/${action}`, extra)

  return (
    <div className="space-y-4 md:space-y-5">
      <div>
        <h1 className="text-lg font-bold text-textprimary md:text-2xl">LGU Dashboard — {lgu?.name}</h1>
        <p className="mt-0.5 text-xs text-textmuted md:text-sm">{lgu?.province}, {lgu?.region} · Response operations</p>
      </div>

      {/* Stats — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 gap-2 md:gap-4 md:grid-cols-4">
        <Stat label="Pending" value={stats.pending} tone="text-amber-600" />
        <Stat label="Verified" value={stats.verified} tone="text-red-600" />
        <Stat label="Resolved (7d)" value={stats.resolved} tone="text-emerald-600" />
        <Stat label="Avg response" value={`${stats.avg_response_hours}h`} tone="text-secondary" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filter by status" style={{ scrollbarWidth: 'none' }}>
        {['all', 'pending', 'verified', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition sm:h-10 sm:px-4 sm:text-sm ${
              filter === f ? 'bg-primary text-white' : 'bg-card border border-gray-200 text-textmuted hover:bg-gray-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <ul className="space-y-3">
        {filtered.map((r) => (
          <li key={r.id} className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm sm:rounded-2xl sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-xs font-semibold text-textprimary sm:text-sm">#{r.id} · {r.outage_type.replace(/_/g, ' ')} — {r.lgu?.name}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-xs text-textmuted sm:text-sm">{r.description || 'No description provided.'}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-textmuted sm:text-xs">
              <span>Reporter: {r.reporter?.name ?? '—'}</span>
              <span>Severity: {r.ai_severity_score}/100</span>
              <span>{new Date(r.created_at).toLocaleString()}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {r.status === 'pending' && (
                <button onClick={() => act(r, 'verify')}
                  className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 sm:h-10 sm:px-4 sm:text-sm">
                  Verify
                </button>
              )}
              {r.status === 'verified' && (
                <>
                  <input type="text" placeholder="Dispatch notes..." value={notes[r.id] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs sm:h-10 sm:px-3 sm:text-sm"
                    aria-label={`Dispatch notes for report ${r.id}`} />
                  <button onClick={() => act(r, 'dispatch', { dispatch_notes: notes[r.id] ?? '' })} disabled={!notes[r.id]}
                    className="shrink-0 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 sm:h-10 sm:px-4 sm:text-sm">
                    Dispatch
                  </button>
                </>
              )}
              {r.status !== 'resolved' && (
                <button onClick={() => act(r, 'resolve')}
                  className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 sm:h-10 sm:px-4 sm:text-sm">
                  Resolved
                </button>
              )}
              <a href={`/reports/${r.id}`}
                className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-gray-50 sm:h-10 sm:px-4 sm:text-sm">
                Details
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
      <div className="text-[10px] font-medium uppercase tracking-wide text-textmuted sm:text-xs">{label}</div>
      <div className={`mt-1 text-xl font-bold tracking-tight sm:mt-1 sm:text-3xl ${tone}`}>{value}</div>
    </div>
  )
}
