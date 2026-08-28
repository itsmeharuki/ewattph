import { usePage, Link } from '@inertiajs/react'
import { Users, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const { auth = {} } = usePage().props
  const user = auth?.user

  const sections = [
    { label: 'User Management', desc: 'Create, edit, deactivate, recover, and manage all user accounts and roles.', href: '/admin/users', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'System Logs', desc: 'View audit trail, error logs, and activity history.', href: '/admin/logs', icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-lg font-bold text-textprimary md:text-2xl">System Administration</h1>
        <p className="mt-1 text-xs text-textmuted md:text-sm">Manage users, system settings, and monitor platform health.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {sections.map(({ label, desc, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md hover:border-primary/30 sm:p-6">
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg sm:mb-3 sm:h-10 sm:w-10 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-textprimary group-hover:text-primary md:text-base">{label}</h2>
            <p className="mt-1 text-xs text-textmuted md:text-sm">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-textmuted">Logged in as</h2>
        <p className="mt-1 text-sm text-textprimary">{user?.name} &middot; {user?.email}</p>
        <p className="mt-0.5 text-xs text-textmuted">Super Admin &middot; System-wide access</p>
      </div>
    </div>
  )
}
