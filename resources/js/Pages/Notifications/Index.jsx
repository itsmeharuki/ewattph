import { router } from '@inertiajs/react'
import { Bell, AlertTriangle, RefreshCw } from 'lucide-react'

const categoryIcon = {
  alerts: <AlertTriangle className="h-5 w-5 text-danger" />,
  updates: <Bell className="h-5 w-5 text-secondary" />,
  system: <RefreshCw className="h-5 w-5 text-textmuted" />,
}

export default function NotificationsIndex({ notifications }) {
  const markRead = (n) => {
    if (!n.read_at) router.patch(`/notifications/${n.id}/read`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {notifications.data.some((n) => !n.read_at) && (
          <button onClick={() => router.post('/notifications/read-all')}
            className="h-10 rounded-lg border border-gray-300 bg-card px-4 text-sm font-semibold hover:bg-gray-50">
            Mark all read
          </button>
        )}
      </div>

      {notifications.data.length === 0 ? (
        <p className="rounded-2xl border border-brandborder bg-card p-8 text-center text-sm text-textmuted">You're all caught up!</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-2xl border border-brandborder bg-card shadow-sm">
          {notifications.data.map((n) => (
            <li key={n.id} onClick={() => markRead(n)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition ${!n.read_at ? 'bg-secondary/5' : 'opacity-60'}`}>
              <span className="mt-0.5">{categoryIcon[n.category] ?? categoryIcon.updates}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" aria-label="Unread" />}
                  <h2 className="truncate text-sm font-semibold">{n.title}</h2>
                </div>
                <p className="mt-0.5 text-sm text-textmuted">{n.message}</p>
                <time className="mt-1 block text-xs text-textmuted">{new Date(n.created_at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ul>
      )}

      {notifications.links.length > 3 && (
        <nav className="flex justify-center gap-2" aria-label="Pagination">
          {notifications.links.map((l, i) => l.url ? (
            <a key={i} href={l.url} className={`rounded-lg px-3 py-2 text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
