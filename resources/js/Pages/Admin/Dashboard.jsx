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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-textprimary">System Administration</h1>
        <p className="mt-1 text-sm text-textmuted">Manage users, system settings, and monitor platform health.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ label, desc, href, icon: Icon, color }) => (
          <Link key={href} href={href}
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-primary/30">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-textprimary group-hover:text-primary">{label}</h2>
            <p className="mt-1 text-sm text-textmuted">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-textmuted">Logged in as</h2>
        <p className="mt-1 text-sm text-textprimary">{user?.name} &middot; {user?.email}</p>
        <p className="mt-0.5 text-xs text-textmuted">Super Admin &middot; System-wide access</p>
      </div>
    </div>
  )
}
