import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import Logo from '../../Components/Logo'

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-textmuted">{label}</label>
      {children}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}

export const inputCls = (error) =>
  `h-12 w-full rounded-lg border bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 ${error ? 'border-danger' : 'border-brandborder'}`

/** Shared auth shell — consistent with the main eGovPH-style UI */
export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" aria-label="eWattPH home">
        <Logo size="h-11" />
      </Link>

      <div className="mt-6 w-full max-w-md rounded-2xl border border-brandborder bg-card p-8 shadow-xl shadow-[#0040E7]/5">
        <h1 className="text-center text-xl font-bold tracking-tight text-textprimary">{title}</h1>
        <p className="mt-1.5 text-center text-sm font-light text-textmuted">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>

      <div className="mt-6 text-center text-sm text-textmuted">{footer}</div>
    </div>
  )
}
