const styles = {
  pending: 'bg-accent/10 text-amber-700 border-accent/40',
  verified: 'bg-danger/10 text-red-700 border-danger/40',
  resolved: 'bg-success/10 text-emerald-700 border-success/40',
  in_review: 'bg-secondary/10 text-blue-700 border-secondary/40',
  approved: 'bg-success/10 text-emerald-700 border-success/40',
  rejected: 'bg-danger/10 text-red-700 border-danger/40',
  submitted: 'bg-gray-100 text-gray-600 border-gray-300',
}

export default function StatusBadge({ status }) {
  const label = String(status || '').replace(/_/g, ' ')
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || styles.submitted}`}>
      {label}
    </span>
  )
}
