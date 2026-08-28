import { Link } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'

export default function ReportsIndex({ reports }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold md:text-2xl">My Outage Reports</h1>
        <Link href="/reports/create" className="h-10 rounded-lg bg-primary px-3 inline-flex items-center text-xs font-semibold text-white hover:bg-primary-dark sm:h-11 sm:px-4 sm:text-sm">
          + Report Outage
        </Link>
      </div>

      {reports.data.length === 0 ? (
        <div className="rounded-2xl border border-brandborder bg-card p-6 text-center text-sm text-textmuted sm:p-8">
          You have not reported any outages yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.data.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`} className="block rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:rounded-2xl sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold sm:text-sm">Ticket #{String(r.id).padStart(6, '0')} — {r.lgu?.name ?? 'Unknown LGU'}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-textmuted sm:text-sm">{r.description || r.outage_type.replace(/_/g, ' ')}</p>
                <p className="mt-1 text-[10px] text-textmuted sm:text-xs">
                  Severity: {r.ai_severity_score}/100 · Filed {new Date(r.created_at).toLocaleString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {reports.links.length > 3 && (
        <nav className="flex justify-center gap-1.5 sm:gap-2" aria-label="Pagination">
          {reports.links.map((l, i) => l.url ? (
            <Link key={i} href={l.url} className={`rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
