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
    <div className="flex min-h-dvh flex-col items-center px-4 pb-16 pt-10 md:pt-12">
      <Link href="/" aria-label="eWattPH home">
        <Logo size="h-14" showText={false} />
      </Link>

      <div className="mt-2 w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold tracking-tight text-textprimary">{title}</h1>
        <p className="mt-2 text-center text-sm font-light text-textmuted">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>

      <div className="mt-8 text-center text-sm text-textmuted">{footer}</div>
    </div>
  )
}
