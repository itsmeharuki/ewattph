import { router } from '@inertiajs/react'
import { CheckCircle, XCircle } from 'lucide-react'

export default function LguApprovals({ pendingUsers }) {
  const approve = (id) => {
    if (!confirm('Approve this LGU account?')) return
    router.patch(`/admin/lgu-approvals/${id}/approve`, {}, { preserveScroll: true })
  }

  const reject = (id) => {
    if (!confirm('Reject and remove this LGU account?')) return
    router.patch(`/admin/lgu-approvals/${id}/reject`, {}, { preserveScroll: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textprimary">LGU Approvals</h1>
        <p className="mt-1 text-sm text-textmuted">Review pending LGU registration requests.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-textmuted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">LGU</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pendingUsers.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-textmuted">
                  No pending LGU approvals.
                </td>
              </tr>
            )}
            {pendingUsers.data.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-textprimary">{u.name}</div>
                  <div className="text-xs text-textmuted">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-textprimary">
                    {u.role?.name?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-textmuted">
                  {u.lgu?.name}{u.lgu?.province ? `, ${u.lgu.province}` : ''}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => approve(u.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button onClick={() => reject(u.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pendingUsers.links.length > 3 && (
        <nav className="flex justify-center gap-2">
          {pendingUsers.links.map((l, i) => l.url ? (
            <a key={i} href={l.url}
              className={`rounded-lg px-3 py-2 text-sm ${l.active ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-textprimary'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
