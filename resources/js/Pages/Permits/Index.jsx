import { Link } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'

export default function PermitsIndex({ permits, isPublicTracker = false }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{isPublicTracker ? 'Public Permit Tracker' : 'My Permit Applications'}</h1>
          <p className="text-sm text-textmuted">Transparent energy permit tracking — from application to approval.</p>
        </div>
        <Link href="/permits/apply" className="h-11 rounded-lg bg-primary px-4 inline-flex items-center font-semibold text-white hover:bg-primary-dark">
          + Apply for a Permit
        </Link>
      </div>

      {permits.data.length === 0 ? (
        <div className="rounded-2xl border border-brandborder bg-card p-8 text-center text-sm text-textmuted">
          No permit applications found.
        </div>
      ) : (
        <ul className="space-y-3">
          {permits.data.map((p) => (
            <li key={p.id}>
              <Link href={`/permits/${p.id}`} className="block rounded-2xl border border-brandborder bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    #{String(p.id).padStart(6, '0')} — {p.permit_type.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-textmuted">{p.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-textmuted">
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
        <nav className="flex justify-center gap-2" aria-label="Pagination">
          {permits.links.map((l, i) => l.url ? (
            <Link key={i} href={l.url} className={`rounded-lg px-3 py-2 text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
