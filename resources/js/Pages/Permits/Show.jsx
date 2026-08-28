import { useState } from 'react'
import { router } from '@inertiajs/react'
import StatusBadge from '../../Components/StatusBadge'

export default function Show({ permit, auth = {} }) {
  const ai = permit.ai_metadata || {}
  const canReview = auth?.user?.canReviewPermits
  const [decisionForm, setDecisionForm] = useState({ decision: 'in_review', note: '' })
  const [processing, setProcessing] = useState(false)

  const decide = (e) => {
    e.preventDefault()
    setProcessing(true)
    router.post(`/permits/${permit.id}/review`, decisionForm, { onFinish: () => setProcessing(false) })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <a href="/permits/tracker" className="text-xs font-semibold text-secondary hover:underline sm:text-sm">&larr; Permit tracker</a>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <h1 className="text-base font-bold capitalize md:text-xl">{permit.permit_type.replace(/_/g, ' ')}</h1>
          <StatusBadge status={permit.status} />
        </div>
        <p className="text-[10px] text-textmuted sm:text-sm">Reference #{String(permit.id).padStart(6, '0')} · {permit.lgu?.name ?? permit.agency?.abbreviation ?? '—'}</p>
        <p className="mt-3 text-xs sm:text-sm">{permit.description}</p>

        {ai.summary && (
          <div className="mt-4 rounded-lg bg-secondary/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-secondary sm:text-xs">AI pre-screening — compliance {ai.compliance_score ?? permit.ai_compliance_score}/100</p>
            <p className="mt-1 text-xs sm:text-sm">{ai.summary}</p>
            {ai.issues?.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-xs text-red-700 sm:text-sm">
                {ai.issues.map((i, k) => <li key={k}>{i}</li>)}
              </ul>
            )}
          </div>
        )}

        {(permit.documents?.length ?? 0) > 0 && (
          <div className="mt-4">
            <h2 className="text-[10px] font-semibold uppercase tracking-wide text-textmuted sm:text-xs">Documents</h2>
            <ul className="mt-1 space-y-1 text-xs sm:text-sm">
              {permit.documents.map((d, i) => (
                <li key={i}><a href={`/storage/${d.path}`} target="_blank" rel="noopener" className="text-secondary hover:underline">{d.name}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <h2 className="text-sm font-semibold md:text-base">Status Timeline</h2>
        <ol className="mt-3 space-y-3 border-l-2 border-gray-200 pl-3 sm:pl-4">
          {permit.status_histories.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full bg-secondary sm:-left-[22px] sm:h-2.5 sm:w-2.5" />
              <p className="text-xs font-semibold capitalize sm:text-sm">{h.new_status.replace(/_/g, ' ')}</p>
              {h.note && <p className="text-xs text-textmuted sm:text-sm">{h.note}</p>}
              <time className="text-[10px] text-textmuted sm:text-xs">{new Date(h.created_at).toLocaleString()} · {h.user?.name ?? ''}</time>
            </li>
          ))}
        </ol>
      </div>

      {/* Review actions */}
      {canReview && !['approved', 'rejected'].includes(permit.status) && (
        <form onSubmit={decide} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <h2 className="text-sm font-semibold md:text-base">Department Review</h2>
          <select value={decisionForm.decision} onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm sm:h-12" aria-label="Decision">
            <option value="in_review">Move to in review</option>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </select>
          <textarea rows={3} placeholder="Comments / decision notes..." value={decisionForm.note}
            onChange={(e) => setDecisionForm({ ...decisionForm, note: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
          <button type="submit" disabled={processing}
            className="h-11 w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:h-12">
            {processing ? 'Saving...' : 'Record Decision'}
          </button>
        </form>
      )}

      {permit.decision_note && ['approved', 'rejected'].includes(permit.status) && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
          <h2 className="text-sm font-semibold md:text-base">Decision Note</h2>
          <p className="mt-1 text-xs text-textmuted sm:text-sm">{permit.decision_note}</p>
          {permit.reviewer && <p className="mt-1 text-[10px] text-textmuted sm:text-xs">— {permit.reviewer.name}, {new Date(permit.reviewed_at).toLocaleString()}</p>}
        </div>
      )}
    </div>
  )
}
