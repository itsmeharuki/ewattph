import { useState } from 'react'
import { router, Link } from '@inertiajs/react'
import { AuthShell, Field, inputCls } from './AuthShell'

export default function Register() {
  const [data, setData] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setProcessing(true)
    router.post('/register/send-otp', data, {
      onError: setErrors,
      onFinish: () => setProcessing(false),
    })
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Report outages and track permits with eWattPH"
      footer={
        <div className="flex flex-col items-center gap-3">
          <p>
            Already registered?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
          </p>
          <Link href="/" className="text-xs text-textmuted hover:text-primary hover:underline">Back to home</Link>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Full name" error={errors.name}>
          <input type="text" value={data.name} required autoFocus autoComplete="name" placeholder="Juan dela Cruz"
            onChange={(e) => setData({ ...data, name: e.target.value })} className={inputCls(errors.name)} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={data.email} required autoComplete="email" placeholder="you@example.com"
            onChange={(e) => setData({ ...data, email: e.target.value })} className={inputCls(errors.email)} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" value={data.password} required autoComplete="new-password" placeholder="Minimum 8 characters"
            onChange={(e) => setData({ ...data, password: e.target.value })} className={inputCls(errors.password)} />
        </Field>
        <Field label="Confirm password" error={errors.password_confirmation}>
          <input type="password" value={data.password_confirmation} required autoComplete="new-password" placeholder="••••••••"
            onChange={(e) => setData({ ...data, password_confirmation: e.target.value })} className={inputCls()} />
        </Field>
        <button type="submit" disabled={processing}
          className="h-12 w-full rounded-lg bg-primary font-medium text-white shadow-md shadow-[#0040E7]/25 transition hover:bg-primary/90 disabled:opacity-60">
          {processing ? 'Sending verification code...' : "Continue"}
        </button>
      </form>
    </AuthShell>
  )
}
