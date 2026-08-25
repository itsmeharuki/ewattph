import { useState } from 'react'
import { router } from '@inertiajs/react'
import { ScrollText } from 'lucide-react'

export default function AdminUsers({ users, roles, lgus, agencies, auditLogs }) {
  const [edits, setEdits] = useState({})

  const save = (u) => {
    const patch = edits[u.id] ?? {}
    router.patch(`/admin/users/${u.id}`, {
      role_id: patch.role_id ?? u.role_id,
      lgu_id: patch.lgu_id ?? u.lgu_id ?? '',
      agency_id: patch.agency_id ?? u.agency_id ?? '',
    }, { preserveScroll: true })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin — User & Role Management</h1>

      <div className="overflow-x-auto rounded-2xl border border-brandborder bg-card shadow-sm">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-textmuted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">LGU</th>
              <th className="px-4 py-3">Agency</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.data.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-textmuted">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select value={edits[u.id]?.role_id ?? u.role?.id} onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], role_id: e.target.value } })}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs capitalize" aria-label={`Role for ${u.name}`}>
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={edits[u.id]?.lgu_id ?? u.lgu_id ?? ''} onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], lgu_id: e.target.value } })}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs" aria-label={`LGU for ${u.name}`}>
                    <option value="">—</option>
                    {lgus.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select value={edits[u.id]?.agency_id ?? u.agency_id ?? ''} onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], agency_id: e.target.value } })}
                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs" aria-label={`Agency for ${u.name}`}>
                    <option value="">—</option>
                    {agencies.map((a) => <option key={a.id} value={a.id}>{a.abbreviation}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => save(u)} className="h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark">Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.links.length > 3 && (
        <nav className="flex justify-center gap-2">
          {users.links.map((l, i) => l.url ? (
            <a key={i} href={l.url} className={`rounded-lg px-3 py-2 text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}

      {/* Audit trail */}
      <div className="rounded-2xl border border-brandborder bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-semibold"><ScrollText className="h-5 w-5 text-secondary" /> Recent Audit Log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {auditLogs.map((log) => (
            <li key={log.id} className="flex flex-wrap gap-x-2">
              <strong>{log.user?.name ?? '—'}</strong>
              <span className="text-textmuted">{log.action}</span>
              <span className="text-xs text-textmuted">{log.entity_type.split('\\').pop()} #{log.entity_id}</span>
              <time className="ml-auto text-xs text-textmuted">{new Date(log.created_at).toLocaleString()}</time>
            </li>
          ))}
          {auditLogs.length === 0 && <li className="text-textmuted">No audit entries yet.</li>}
        </ul>
      </div>
    </div>
  )
}
