import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { AuthShell, Field, inputCls } from './AuthShell'

export default function Login() {
  const [data, setData] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setProcessing(true)
    router.post('/login', data, {
      onError: setErrors,
      onFinish: () => setProcessing(false),
    })
  }

  return (
    <AuthShell
      title="Login"
      subtitle="Sign in to your eWattPH account"
      footer={
        <div className="flex flex-col items-center gap-3">
          <p>
            No account yet?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">Create one</Link>
          </p>
          <Link href="/" className="text-xs text-textmuted hover:text-primary hover:underline">Back to home</Link>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Email" error={errors.email}>
          <input type="email" value={data.email} required autoFocus autoComplete="username" placeholder="you@example.com"
            onChange={(e) => setData({ ...data, email: e.target.value })} className={inputCls(errors.email)} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={data.password} required autoComplete="current-password" placeholder="••••••••"
            onChange={(e) => setData({ ...data, password: e.target.value })} className={inputCls(errors.password)} />
        </Field>
        <label className="flex items-center gap-2.5 text-sm text-textmuted">
          <input type="checkbox" checked={data.remember} onChange={(e) => setData({ ...data, remember: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 accent-[#0040E7]" />
          Remember me
        </label>
        <button type="submit" disabled={processing}
          className="h-12 w-full rounded-lg bg-primary font-medium text-white shadow-md shadow-[#0040E7]/25 transition hover:bg-primary/90 disabled:opacity-60">
          {processing ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}
