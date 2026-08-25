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
      <a href="/permits/tracker" className="text-sm font-semibold text-secondary hover:underline">← Permit tracker</a>

      <div className="rounded-2xl border border-brandborder bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-bold capitalize">{permit.permit_type.replace(/_/g, ' ')}</h1>
          <StatusBadge status={permit.status} />
        </div>
        <p className="text-sm text-textmuted">Reference #{String(permit.id).padStart(6, '0')} · {permit.lgu?.name ?? permit.agency?.abbreviation ?? '—'}</p>
        <p className="mt-3 text-sm">{permit.description}</p>

        {ai.summary && (
          <div className="mt-4 rounded-lg bg-secondary/5 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-secondary">AI pre-screening — compliance {ai.compliance_score ?? permit.ai_compliance_score}/100</p>
            <p className="mt-1 text-sm">{ai.summary}</p>
            {ai.issues?.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-sm text-red-700">
                {ai.issues.map((i, k) => <li key={k}>{i}</li>)}
              </ul>
            )}
          </div>
        )}

        {(permit.documents?.length ?? 0) > 0 && (
          <div className="mt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-textmuted">Documents</h2>
            <ul className="mt-1 space-y-1 text-sm">
              {permit.documents.map((d, i) => (
                <li key={i}><a href={`/storage/${d.path}`} target="_blank" rel="noopener" className="text-secondary hover:underline">{d.name}</a></li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Timeline (public transparency) */}
      <div className="rounded-2xl border border-brandborder bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Status Timeline</h2>
        <ol className="mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
          {permit.status_histories.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-secondary" />
              <p className="text-sm font-semibold capitalize">{h.new_status.replace(/_/g, ' ')}</p>
              {h.note && <p className="text-sm text-textmuted">{h.note}</p>}
              <time className="text-xs text-textmuted">{new Date(h.created_at).toLocaleString()} · {h.user?.name ?? ''}</time>
            </li>
          ))}
        </ol>
      </div>

      {/* Review actions */}
      {canReview && !['approved', 'rejected'].includes(permit.status) && (
        <form onSubmit={decide} className="space-y-3 rounded-2xl border border-brandborder bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Department Review</h2>
          <select value={decisionForm.decision} onChange={(e) => setDecisionForm({ ...decisionForm, decision: e.target.value })}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm" aria-label="Decision">
            <option value="in_review">Move to in review</option>
            <option value="approved">Approve</option>
            <option value="rejected">Reject</option>
          </select>
          <textarea rows={3} placeholder="Comments / decision notes…" value={decisionForm.note}
            onChange={(e) => setDecisionForm({ ...decisionForm, note: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm" />
          <button type="submit" disabled={processing}
            className="h-12 w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {processing ? 'Saving…' : 'Record Decision'}
          </button>
        </form>
      )}

      {permit.decision_note && ['approved', 'rejected'].includes(permit.status) && (
        <div className="rounded-2xl border border-brandborder bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Decision Note</h2>
          <p className="mt-1 text-sm text-textmuted">{permit.decision_note}</p>
          {permit.reviewer && <p className="mt-1 text-xs text-textmuted">— {permit.reviewer.name}, {new Date(permit.reviewed_at).toLocaleString()}</p>}
        </div>
      )}
    </div>
  )
}
