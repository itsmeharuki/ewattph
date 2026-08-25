import { Link } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'

export default function ReportsIndex({ reports }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Outage Reports</h1>
        <Link href="/reports/create" className="h-11 rounded-lg bg-primary px-4 inline-flex items-center font-semibold text-white hover:bg-primary-dark">
          + Report Outage
        </Link>
      </div>

      {reports.data.length === 0 ? (
        <div className="rounded-2xl border border-brandborder bg-card p-8 text-center text-sm text-textmuted">
          You have not reported any outages yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.data.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`} className="block rounded-2xl border border-brandborder bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">Ticket #{String(r.id).padStart(6, '0')} — {r.lgu?.name ?? 'Unknown LGU'}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-textmuted">{r.description || r.outage_type.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-xs text-textmuted">
                  Severity: {r.ai_severity_score}/100 · Filed {new Date(r.created_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {reports.links.length > 3 && (
        <nav className="flex justify-center gap-2" aria-label="Pagination">
          {reports.links.map((l, i) => l.url ? (
            <Link key={i} href={l.url} className={`rounded-lg px-3 py-2 text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
