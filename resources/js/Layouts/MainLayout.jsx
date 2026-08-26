import { useState } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { Home, MapPin, FileText, User, Menu, X, Zap, Radar } from 'lucide-react'
import Logo from '../Components/Logo'
import NotificationBell from '../Components/NotificationBell'
import Footer from '../Components/Footer'

const NAV = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Monitoring', href: '/monitoring', icon: Radar },
  { label: 'Live Map', href: '/map', icon: MapPin },
  { label: 'Reports', href: '/reports', icon: FileText, auth: true },
  { label: 'Permits', href: '/permits/tracker', icon: FileText },
]

export default function MainLayout({ children }) {
  const { auth = {}, flash = {} } = usePage().props
  const user = auth?.user ?? null
  const unread = auth?.unreadNotifications ?? 0
  const [menuOpen, setMenuOpen] = useState(false)

  // e.gov.ph nav mapping: Home / Monitoring / Live Map / Reports / Permits (+ role links)
  const links = [
    NAV[0],
    NAV[1],
    NAV[2],
    ...(user ? [NAV[3]] : []),
    NAV[4],
    ...(user?.canManageLgu ? [{ label: 'LGU Dashboard', href: '/lgu/dashboard' }] : []),
    ...(user?.isSuperAdmin ? [{ label: 'Admin', href: '/admin/users' }] : []),
  ]

  const isActive = (href) => window.location.pathname === href || window.location.pathname.startsWith(`${href}/`)

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Sticky frosted header — e.gov.ph style */}
      <header className="sticky top-0 z-40 border-b border-brandborder bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-8">
          <Link href="/" className="flex items-center" aria-label="eWattPH home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {links.map(({ label, href }) => (
              <Link key={label} href={href}
                className={`rounded-lg px-4 py-2 text-[15px] font-medium transition ${
                  isActive(href) ? 'text-primary' : 'text-textprimary hover:text-primary'}`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {user && <NotificationBell count={unread} onClick={() => router.visit('/notifications')} />}
            {user ? (
              <>
                <Link href="/profile"
                  className="hidden min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-textprimary transition hover:text-primary md:flex">
                  {user.name}
                </Link>
                {/* e.gov.ph "Get Started" primary CTA */}
                <button onClick={() => router.post('/logout')}
                  className="hidden h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 md:inline-flex">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden h-10 items-center rounded-lg px-4 text-sm font-medium text-textprimary transition hover:text-primary md:inline-flex">
                  Log in
                </Link>
                <Link href="/register"
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white shadow-[#0040E7]/20 transition hover:bg-primary/90 hover:shadow-lg">
                  <Zap className="h-4 w-4" /> Get Started
                </Link>
              </>
            )}
            <button className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-textprimary transition hover:bg-tint md:hidden"
              onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="space-y-1 border-t border-brandborder bg-white px-4 py-3 md:hidden" aria-label="Mobile navigation">
            {links.map(({ label, href }) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-3 text-[15px] font-medium ${isActive(href) ? 'bg-tint text-primary' : 'text-textprimary hover:bg-muted'}`}>
                {label}
              </Link>
            ))}
            <hr className="my-2 border-gray-100" />
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium text-textprimary hover:bg-muted">Profile & Settings</Link>
                <button onClick={() => router.post('/logout')} className="block w-full rounded-lg px-3 py-3 text-left text-[15px] font-medium text-danger hover:bg-muted">Log out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium text-primary hover:bg-muted">Log in</Link>
            )}
          </nav>
        )}
      </header>

      {/* Flash toasts */}
      {flash.success && (
        <div role="status" className="mx-auto mt-4 w-full max-w-7xl px-4 md:px-8">
          <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-emerald-700">{flash.success}</div>
        </div>
      )}
      {flash.error && (
        <div role="alert" className="mx-auto mt-4 w-full max-w-7xl px-4 md:px-8">
          <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-medium text-red-700">{flash.error}</div>
        </div>
      )}

      {/* Content shell — centered max width so cards never stretch edge-to-edge */}
      <main className="w-full flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-12">
        <div className="mx-auto w-full max-w-7xl 2xl:max-w-[1400px]">{children}</div>
      </main>

      <Footer />

      {/* Bottom nav (mobile) */}
      {user && (
        <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-brandborder bg-white/95 backdrop-blur-md md:hidden" aria-label="Bottom navigation">
          {[NAV[0], NAV[1], NAV[2], { label: 'Profile', href: '/profile', icon: User }].filter((l) => !l.auth || user).map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href}
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition ${
                isActive(href) ? 'text-primary' : 'text-textmuted'}`}>
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
