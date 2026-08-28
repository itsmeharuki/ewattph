import { Link } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'
import MapView from '../../Components/MapView'

export default function Show({ report }) {
  const ai = report.ai_metadata || {}

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/reports" className="text-xs font-semibold text-secondary hover:underline sm:text-sm">&larr; All reports</Link>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <h1 className="text-base font-bold md:text-xl">Ticket #{String(report.id).padStart(6, '0')}</h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="mt-1 text-xs text-textmuted sm:text-sm">{report.lgu?.name}, {report.lgu?.province} · {report.outage_type.replace(/_/g, ' ')}</p>
        {report.description && <p className="mt-3 text-xs sm:text-sm">{report.description}</p>}
        {report.resolved_at && (
          <p className="mt-2 rounded-lg bg-success/10 px-3 py-2 text-xs font-medium text-emerald-700 sm:text-sm">
            Power restored on {new Date(report.resolved_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* AI analysis */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold md:text-base">AI Analysis</h2>
          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-blue-700 uppercase sm:text-xs">{ai.source ?? 'pending'}</span>
        </div>

        <div className="mt-3" aria-label={`Severity ${ai.severity_score ?? report.ai_severity_score} out of 100`}>
          <div className="flex items-center justify-between text-[10px] font-medium text-textmuted sm:text-xs"><span>Severity score</span><span>{ai.severity_score ?? report.ai_severity_score}/100</span></div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 sm:h-2">
            <div className="h-full rounded-full transition-all" style={{
              width: `${ai.severity_score ?? report.ai_severity_score}%`,
              background: (ai.severity_score ?? report.ai_severity_score) >= 70 ? '#EF4444' : (ai.severity_score ?? report.ai_severity_score) >= 40 ? '#F59E0B' : '#10B981',
            }} />
          </div>
        </div>

        {ai.probable_cause && <p className="mt-3 text-xs sm:text-sm"><strong>Probable cause:</strong> {ai.probable_cause}</p>}
        {(ai.suggested_actions?.length ?? 0) > 0 && (
          <>
            <h3 className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-textmuted sm:text-xs">Suggested actions</h3>
            <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-textmuted sm:text-sm">
              {ai.suggested_actions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </>
        )}
      </div>

      <div className="h-[250px] overflow-hidden rounded-lg sm:h-[300px] sm:rounded-xl">
        <MapView reports={[{ id: report.id, lat: +report.latitude, lng: +report.longitude, status: report.status, severity: report.ai_severity_score, lgu: report.lgu?.name }]}
          lockPH={false} center={[+report.longitude, +report.latitude]} zoom={14} />
      </div>
    </div>
  )
}
