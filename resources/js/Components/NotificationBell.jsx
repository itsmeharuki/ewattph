import { Bell } from 'lucide-react'

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
      className="relative min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition"
    >
      <Bell className="h-5 w-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute top-1 right-1 bg-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
