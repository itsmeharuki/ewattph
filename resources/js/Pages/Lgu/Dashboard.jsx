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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">LGU Dashboard — {lgu?.name}</h1>
        <p className="text-sm text-textmuted">{lgu?.province}, {lgu?.region} · Response operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Pending" value={stats.pending} tone="text-amber-600" />
        <Stat label="Verified (active)" value={stats.verified} tone="text-red-600" />
        <Stat label="Resolved (7d)" value={stats.resolved} tone="text-emerald-600" />
        <Stat label="Avg response (hrs)" value={stats.avg_response_hours} tone="text-secondary" />
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {['all', 'pending', 'verified', 'resolved'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} role="tab" aria-selected={filter === f}
            className={`h-10 rounded-full px-4 text-sm font-semibold capitalize transition ${filter === f ? 'bg-primary text-white' : 'bg-card border border-gray-200 text-textmuted hover:bg-gray-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <ul className="space-y-3">
        {filtered.map((r) => (
          <li key={r.id} className="rounded-2xl border border-brandborder bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">#{r.id} · {r.outage_type.replace(/_/g, ' ')} — {r.lgu?.name}</span>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-sm text-textmuted">{r.description || 'No description provided.'}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-textmuted">
              <span>Reporter: {r.reporter?.name ?? '—'}</span>
              <span>Severity: {r.ai_severity_score}/100</span>
              <span>{new Date(r.created_at).toLocaleString()}</span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {r.status === 'pending' && (
                <button onClick={() => act(r, 'verify')}
                  className="h-10 rounded-lg bg-danger px-4 text-sm font-semibold text-white hover:brightness-95">Verify</button>
              )}
              {r.status === 'verified' && (
                <>
                  <input type="text" placeholder="Dispatch notes / team assigned…" value={notes[r.id] ?? ''}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    className="h-10 min-w-[220px] flex-1 rounded-lg border border-gray-300 px-3 text-sm" aria-label={`Dispatch notes for report ${r.id}`} />
                  <button onClick={() => act(r, 'dispatch', { dispatch_notes: notes[r.id] ?? '' })} disabled={!notes[r.id]}
                    className="h-10 rounded-lg bg-secondary px-4 text-sm font-semibold text-white disabled:opacity-50">Dispatch</button>
                </>
              )}
              {r.status !== 'resolved' && (
                <button onClick={() => act(r, 'resolve')}
                  className="h-10 rounded-lg bg-success px-4 text-sm font-semibold text-white hover:brightness-95">Mark Resolved</button>
              )}
              <a href={`/reports/${r.id}`} className="h-10 inline-flex items-center rounded-lg border border-gray-300 px-4 text-sm font-semibold text-secondary hover:bg-gray-50">Details</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-brandborder bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-[#0040E7]/10">
      <div className="text-xs font-medium uppercase tracking-wide text-textmuted">{label}</div>
      <div className={`mt-1 text-3xl font-bold tracking-tight ${tone}`}>{value}</div>
    </div>
  )
}
