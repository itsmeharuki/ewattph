import { ScrollText } from 'lucide-react'

export default function AdminLogs({ logs }) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-lg font-bold text-textprimary md:text-2xl">System Logs</h1>
        <p className="mt-1 text-xs text-textmuted md:text-sm">Audit trail and system activity history.</p>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="w-full text-sm">
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

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {logs.data.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-textmuted">
            No audit log entries yet.
          </div>
        )}
        {logs.data.map((log) => (
          <div key={log.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-textprimary truncate">{log.user?.name ?? 'System'}</div>
                <div className="text-[11px] text-textmuted truncate">{log.user?.email}</div>
              </div>
              <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-textprimary">
                {log.action}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-textmuted">
              <span>{log.entity_type?.split('\\').pop()} #{log.entity_id}</span>
              <span>{new Date(log.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
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
