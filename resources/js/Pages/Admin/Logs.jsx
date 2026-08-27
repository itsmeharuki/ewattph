import { ScrollText } from 'lucide-react'

export default function AdminLogs({ logs }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textprimary">System Logs</h1>
        <p className="mt-1 text-sm text-textmuted">Audit trail and system activity history.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase tracking-wide text-textmuted">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-textmuted">
                  No audit log entries yet.
                </td>
              </tr>
            )}
            {logs.data.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-textprimary">{log.user?.name ?? 'System'}</div>
                  <div className="text-xs text-textmuted">{log.user?.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-textprimary">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-textmuted">
                  {log.entity_type?.split('\\').pop()} #{log.entity_id}
                </td>
                <td className="px-4 py-3 text-xs text-textmuted">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {logs.links.length > 3 && (
        <nav className="flex justify-center gap-2">
          {logs.links.map((l, i) => l.url ? (
            <a key={i} href={l.url}
              className={`rounded-lg px-3 py-2 text-sm ${l.active ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-textprimary'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
