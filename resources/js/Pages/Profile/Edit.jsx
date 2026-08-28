import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Download, ShieldCheck, Info } from 'lucide-react'

export default function ProfileEdit({ user = {} }) {
  const [form, setForm] = useState({ name: user.name ?? '', email: user.email ?? '', locale: user.locale ?? 'en' })
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pushEnabled, setPushEnabled] = useState(!!user.push_enabled)
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const save = (url, payload) => {
    setProcessing(true)
    router.patch(url, payload, { onError: setErrors, onFinish: () => setProcessing(false), preserveScroll: true })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-bold md:text-2xl">Profile & Settings</h1>

      {/* Account */}
      <form onSubmit={(e) => { e.preventDefault(); save('/profile', form) }}
        className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <h2 className="text-sm font-semibold md:text-base">Account</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-textmuted sm:text-sm" htmlFor="pname">Name</label>
          <input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm sm:h-12" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-textmuted sm:text-sm" htmlFor="pemail">Email</label>
          <input id="pemail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm sm:h-12" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-textmuted sm:text-sm" htmlFor="ploc">Language / Wika</label>
          <select id="ploc" value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm sm:h-12">
            <option value="en">English</option>
            <option value="fil">Filipino</option>
          </select>
        </div>
        <button disabled={processing} className="h-11 w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60">Save profile</button>
      </form>

      {/* Push toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <div>
          <h2 className="text-sm font-semibold md:text-base">Push Notifications</h2>
          <p className="text-[10px] text-textmuted sm:text-xs">Outage alerts and permit updates</p>
        </div>
        <button role="switch" aria-checked={pushEnabled}
          onClick={() => {
            const next = !pushEnabled
            setPushEnabled(next)
            save('/profile/preferences', { push_enabled: next })
          }}
          className={`relative h-7 w-12 rounded-full transition sm:h-8 sm:w-14 ${pushEnabled ? 'bg-success' : 'bg-gray-300'}`}>
          <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all sm:top-1 sm:h-6 sm:w-6 ${pushEnabled ? 'left-5 sm:left-7' : 'left-0.5 sm:left-1'}`} />
        </button>
      </div>

      {/* Password */}
      <form onSubmit={(e) => { e.preventDefault(); save('/profile/password', pw); setPw({ current_password: '', password: '', password_confirmation: '' }) }}
        className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <h2 className="text-sm font-semibold md:text-base">Change Password</h2>
        {[['current_password', 'Current password'], ['password', 'New password'], ['password_confirmation', 'Confirm new password']].map(([k, label]) => (
          <div key={k}>
            <label className="mb-1 block text-xs font-medium text-textmuted sm:text-sm">{label}</label>
            <input type="password" value={pw[k]} required={k !== 'password_confirmation'}
              onChange={(e) => setPw({ ...pw, [k]: e.target.value })}
              className={`h-11 w-full rounded-lg border px-3 text-sm sm:h-12 ${errors[k] ? 'border-danger' : 'border-gray-300'}`} />
          </div>
        ))}
        <button disabled={processing} className="h-11 w-full rounded-lg bg-secondary font-semibold text-white hover:brightness-95 disabled:opacity-60">Update password</button>
      </form>

      {/* Privacy */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-5">
        <h2 className="text-sm font-semibold md:text-base">Privacy</h2>
        <a href="/profile/export" className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-xs font-semibold hover:bg-gray-50 sm:h-11 sm:px-4 sm:text-sm">
          <Download className="h-4 w-4" /> Export my data (JSON)
        </a>
      </div>

      {/* App info */}
      <div className="flex items-start gap-2 rounded-xl border border-gray-200 bg-white p-4 text-xs text-textmuted shadow-sm sm:rounded-2xl sm:p-5 sm:text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold text-textprimary"><ShieldCheck className="mr-1 inline h-4 w-4 text-success" />eWattPH v1.0.0</p>
          <p>National energy emergency intelligence platform. NextGenPH 2026.</p>
        </div>
      </div>
    </div>
  )
}
