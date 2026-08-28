import { router } from '@inertiajs/react'
import { Bell, AlertTriangle, RefreshCw } from 'lucide-react'

const categoryIcon = {
  alerts: <AlertTriangle className="h-4 w-4 text-danger sm:h-5 sm:w-5" />,
  updates: <Bell className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />,
  system: <RefreshCw className="h-4 w-4 text-textmuted sm:h-5 sm:w-5" />,
}

export default function NotificationsIndex({ notifications }) {
  const markRead = (n) => {
    if (!n.read_at) router.patch(`/notifications/${n.id}/read`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-bold md:text-2xl">Notifications</h1>
        {notifications.data.some((n) => !n.read_at) && (
          <button onClick={() => router.post('/notifications/read-all')}
            className="h-9 rounded-lg border border-gray-300 bg-card px-3 text-xs font-semibold hover:bg-gray-50 sm:h-10 sm:px-4 sm:text-sm">
            Mark all read
          </button>
        )}
      </div>

      {notifications.data.length === 0 ? (
        <p className="rounded-2xl border border-brandborder bg-card p-6 text-center text-sm text-textmuted sm:p-8">You're all caught up!</p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-2xl">
          {notifications.data.map((n) => (
            <li key={n.id} onClick={() => markRead(n)}
              className={`flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition sm:gap-3 sm:px-4 sm:py-3 ${!n.read_at ? 'bg-secondary/5' : 'opacity-60'}`}>
              <span className="mt-0.5 shrink-0">{categoryIcon[n.category] ?? categoryIcon.updates}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {!n.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary sm:h-2 sm:w-2" aria-label="Unread" />}
                  <h2 className="truncate text-xs font-semibold sm:text-sm">{n.title}</h2>
                </div>
                <p className="mt-0.5 text-xs text-textmuted sm:text-sm">{n.message}</p>
                <time className="mt-0.5 block text-[10px] text-textmuted sm:text-xs">{new Date(n.created_at).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ul>
      )}

      {notifications.links.length > 3 && (
        <nav className="flex justify-center gap-1.5 sm:gap-2" aria-label="Pagination">
          {notifications.links.map((l, i) => l.url ? (
            <a key={i} href={l.url} className={`rounded-lg px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm ${l.active ? 'bg-primary text-white' : 'bg-card border border-gray-200'}`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}
    </div>
  )
}
