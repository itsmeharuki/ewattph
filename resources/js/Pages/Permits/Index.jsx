import { Link } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'

export default function PermitsIndex({ permits, isPublicTracker = false }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold md:text-2xl">{isPublicTracker ? 'Public Permit Tracker' : 'My Permit Applications'}</h1>
          <p className="text-xs text-textmuted md:text-sm">Transparent energy permit tracking — from application to approval.</p>
        </div>
        {!isPublicTracker && (
          <Link href="/permits/apply" className="h-10 rounded-lg bg-primary px-3 inline-flex items-center text-xs font-semibold text-white hover:bg-primary-dark sm:h-11 sm:px-4 sm:text-sm">
            + Apply for a Permit
          </Link>
        )}
      </div>

      {permits.data.length === 0 ? (
        <div className="rounded-2xl border border-brandborder bg-card p-6 text-center text-sm text-textmuted sm:p-8">
          No permit applications found.
        </div>
      ) : (
        <ul className="space-y-3">
          {permits.data.map((p) => (
            <li key={p.id}>
              <Link href={`/permits/${p.id}`} className="block rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:rounded-2xl sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-semibold capitalize sm:text-sm">
                    {p.permit_type.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-textmuted sm:text-sm">{p.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-textmuted sm:text-xs">
                  <span>{p.lgu?.name ?? p.agency?.abbreviation ?? '—'}</span>
                  {p.ai_compliance_score > 0 && <span>AI compliance: <strong>{p.ai_compliance_score}/100</strong></span>}
                  <span>Submitted {new Date(p.submitted_at).toLocaleDateString()}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {permits.links.length > 3 && (
        <nav className="flex justify-center gap-1.5 sm:gap-2" aria-label="Pagination">
          {permits.links.map((l, i) => l.url ? (
            <Link key={i} href={l.url} className={`rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
