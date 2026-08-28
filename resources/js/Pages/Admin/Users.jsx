import { useState } from 'react'
import { router, Link, usePage } from '@inertiajs/react'
import { Users as UsersIcon, Activity, LayoutDashboard, Search, RotateCcw, Ban, KeyRound, X } from 'lucide-react'

const ADMIN_NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: UsersIcon },
  { label: 'Logs', href: '/admin/logs', icon: Activity },
]

export default function AdminUsers({ users, roles, lgus, agencies }) {
  const [edits, setEdits] = useState({})
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ role_id: '', lgu_id: '', agency_id: '', show_deactivated: false })
  const [resetModal, setResetModal] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const { url } = usePage()

  const applyFilters = () => {
    const params = {}
    if (search) params.search = search
    if (filters.role_id) params.role_id = filters.role_id
    if (filters.lgu_id) params.lgu_id = filters.lgu_id
    if (filters.agency_id) params.agency_id = filters.agency_id
    if (filters.show_deactivated) params.show_deactivated = '1'
    router.get('/admin/users', params, { preserveState: true, replace: true })
  }

  const clearFilters = () => {
    setSearch('')
    setFilters({ role_id: '', lgu_id: '', agency_id: '', show_deactivated: false })
    router.get('/admin/users', {}, { preserveState: true, replace: true })
  }

  const save = (u) => {
    const patch = edits[u.id] ?? {}
    router.patch(`/admin/users/${u.id}`, {
      role_id: patch.role_id ?? u.role_id,
      lgu_id: patch.lgu_id ?? u.lgu_id ?? '',
      agency_id: patch.agency_id ?? u.agency_id ?? '',
    }, { preserveScroll: true })
  }

  const resetPassword = (u) => {
    if (!newPassword || newPassword.length < 8) return
    router.patch(`/admin/users/${u.id}/reset-password`, { new_password: newPassword }, {
      preserveScroll: true,
      onSuccess: () => { setResetModal(null); setNewPassword('') },
    })
  }

  const deactivate = (u) => {
    if (!confirm(`Deactivate ${u.name}'s account? They will not be able to log in.`)) return
    router.patch(`/admin/users/${u.id}/deactivate`, {}, { preserveScroll: true })
  }

  const reactivate = (u) => {
    router.patch(`/admin/users/${u.id}/reactivate`, {}, { preserveScroll: true })
  }

  const inputClass = 'rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm transition focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary/20'

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Admin sub-nav */}
      <nav className="flex gap-1 overflow-x-auto border-b border-gray-100 pb-px" style={{ scrollbarWidth: 'none' }}>
        {ADMIN_NAV.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition md:px-4 ${
              url === href
                ? 'border-primary text-primary'
                : 'border-transparent text-textmuted hover:text-textprimary'
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-textprimary md:text-xl">User Management</h1>
          <p className="mt-0.5 text-xs text-textmuted md:text-sm">{users.total} user{users.total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textmuted" />
          <input type="text" placeholder="Search..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className={`${inputClass} w-full pl-9`} />
        </div>

        <select value={filters.role_id} onChange={(e) => setFilters({ ...filters, role_id: e.target.value })}
          className={`${inputClass} min-w-0 flex-shrink`}>
          <option value="">All roles</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
        </select>

        <select value={filters.lgu_id} onChange={(e) => setFilters({ ...filters, lgu_id: e.target.value })}
          className={`${inputClass} min-w-0 flex-shrink`}>
          <option value="">All LGUs</option>
          {lgus.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>

        <select value={filters.agency_id} onChange={(e) => setFilters({ ...filters, agency_id: e.target.value })}
          className={`${inputClass} min-w-0 flex-shrink`}>
          <option value="">All agencies</option>
          {agencies.map((a) => <option key={a.id} value={a.id}>{a.abbreviation}</option>)}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-textmuted md:text-sm">
          <input type="checkbox" checked={filters.show_deactivated}
            onChange={(e) => setFilters({ ...filters, show_deactivated: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          Deactivated
        </label>

        <div className="flex gap-1.5">
          <button onClick={applyFilters}
            className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-white transition hover:bg-primary/90 md:text-sm md:px-3.5">
            Filter
          </button>
          <button onClick={clearFilters}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-textmuted transition hover:bg-gray-50 md:text-sm md:px-3.5">
            Clear
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-textmuted">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">LGU</th>
              <th className="px-5 py-3">Agency</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-sm text-textmuted">No users found.</td>
              </tr>
            )}
            {users.data.map((u) => {
              const isDeleted = !!u.deleted_at
              return (
                <tr key={u.id} className={`transition ${isDeleted ? 'opacity-40' : 'hover:bg-gray-50/50'}`}>
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-textprimary leading-snug">{u.name}</div>
                    <div className="text-xs text-textmuted mt-0.5">{u.email}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={edits[u.id]?.role_id ?? u.role?.id}
                      onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], role_id: e.target.value } })}
                      disabled={isDeleted}
                      className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs capitalize transition focus:border-primary focus:bg-white focus:outline-none disabled:opacity-40">
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={edits[u.id]?.lgu_id ?? u.lgu_id ?? ''}
                      onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], lgu_id: e.target.value } })}
                      disabled={isDeleted}
                      className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs transition focus:border-primary focus:bg-white focus:outline-none disabled:opacity-40">
                      <option value="">—</option>
                      {lgus.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={edits[u.id]?.agency_id ?? u.agency_id ?? ''}
                      onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], agency_id: e.target.value } })}
                      disabled={isDeleted}
                      className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs transition focus:border-primary focus:bg-white focus:outline-none disabled:opacity-40">
                      <option value="">—</option>
                      {agencies.map((a) => <option key={a.id} value={a.id}>{a.abbreviation}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      isDeleted ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {isDeleted ? 'Deactivated' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!isDeleted ? (
                        <>
                          <button onClick={() => save(u)}
                            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary/90">
                            Save
                          </button>
                          <button onClick={() => setResetModal(u)} title="Reset password"
                            className="rounded-md p-1.5 text-textmuted transition hover:bg-amber-50 hover:text-amber-600">
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button onClick={() => deactivate(u)} title="Deactivate"
                            className="rounded-md p-1.5 text-textmuted transition hover:bg-red-50 hover:text-red-600">
                            <Ban className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => reactivate(u)}
                          className="inline-flex items-center gap-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600">
                          <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {users.data.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-textmuted">No users found.</div>
        )}
        {users.data.map((u) => {
          const isDeleted = !!u.deleted_at
          return (
            <div key={u.id} className={`rounded-xl border border-gray-200 bg-white p-4 ${isDeleted ? 'opacity-40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-textprimary truncate">{u.name}</div>
                  <div className="text-xs text-textmuted truncate">{u.email}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  isDeleted ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isDeleted ? 'Inactive' : 'Active'}
                </span>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <label className="text-[10px] font-medium text-textmuted">Role</label>
                  <select value={edits[u.id]?.role_id ?? u.role?.id}
                    onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], role_id: e.target.value } })}
                    disabled={isDeleted}
                    className="mt-0.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs capitalize transition focus:border-primary focus:bg-white focus:outline-none disabled:opacity-40">
                    {roles.map((r) => <option key={r.id} value={r.id}>{r.name.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-medium text-textmuted">LGU</label>
                    <select value={edits[u.id]?.lgu_id ?? u.lgu_id ?? ''}
                      onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], lgu_id: e.target.value } })}
                      disabled={isDeleted}
                      className="mt-0.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs transition focus:border-primary focus:bg-white focus:outline-none disabled:opacity-40">
                      <option value="">—</option>
                      {lgus.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-textmuted">Agency</label>
                    <select value={edits[u.id]?.agency_id ?? u.agency_id ?? ''}
                      onChange={(e) => setEdits({ ...edits, [u.id]: { ...edits[u.id], agency_id: e.target.value } })}
                      disabled={isDeleted}
                      className="mt-0.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs transition focus:border-primary focus:bg-white focus:outline-none disabled:opacity-40">
                      <option value="">—</option>
                      {agencies.map((a) => <option key={a.id} value={a.id}>{a.abbreviation}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                {!isDeleted ? (
                  <>
                    <button onClick={() => save(u)}
                      className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-white transition hover:bg-primary/90">
                      Save
                    </button>
                    <button onClick={() => setResetModal(u)} title="Reset password"
                      className="rounded-lg border border-gray-200 p-2 text-textmuted transition hover:bg-amber-50 hover:text-amber-600">
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button onClick={() => deactivate(u)} title="Deactivate"
                      className="rounded-lg border border-gray-200 p-2 text-textmuted transition hover:bg-red-50 hover:text-red-600">
                      <Ban className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => reactivate(u)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500 py-2 text-xs font-medium text-white transition hover:bg-emerald-600">
                    <RotateCcw className="h-3.5 w-3.5" /> Reactivate
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {users.links.length > 3 && (
        <nav className="flex items-center justify-center gap-1">
          {users.links.map((l, i) => l.url ? (
            <a key={i} href={l.url}
              className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-center text-xs transition md:min-w-[36px] md:px-3 md:py-1.5 md:text-sm ${
                l.active
                  ? 'bg-primary font-medium text-white'
                  : 'text-textmuted hover:bg-gray-100'
              }`}
              dangerouslySetInnerHTML={{ __html: l.label }} />
          ) : null)}
        </nav>
      )}

      {/* Password Reset Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setResetModal(null)}>
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl md:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-textprimary">Reset Password</h3>
              <button onClick={() => { setResetModal(null); setNewPassword('') }}
                className="rounded-lg p-1 text-textmuted transition hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-textmuted">Set a new password for <span className="font-medium text-textprimary">{resetModal.name}</span>.</p>
            <input type="text" placeholder="New password (min 8 characters)" value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`${inputClass} mt-4 w-full`} />
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setResetModal(null); setNewPassword('') }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-textmuted transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => resetPassword(resetModal)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
