import { useState, useEffect } from 'react'
import { Link, usePage, router } from '@inertiajs/react'
import { Home, MapPin, FileText, User, Menu, X, Zap, Radar, RefreshCw, CheckCircle2, AlertTriangle, ChevronUp, ChevronDown, Eye } from 'lucide-react'
import Logo from '../../Components/Logo'
import NotificationBell from '../../Components/NotificationBell'
import MapView from '../../Components/MapView'
import Footer from '../../Components/Footer'

// Role-based nav — same logic as MainLayout
function buildMapNav(user) {
  const role = typeof user?.role === 'object' ? user?.role?.name : user?.role
  const isLguStaff = role === 'lgu_staff' || role === 'lgu_admin' || role === 'provincial_admin'
  const isAgency = role === 'agency_staff' || role === 'agency_head'
  const isGov = role === 'national_council'
  const isAdmin = role === 'super_admin'
  const isCitizen = role === 'citizen' || role === 'company'

  if (isAdmin) {
    return [
      { label: 'Admin Dashboard', href: '/admin' },
      { label: 'Users', href: '/admin/users' },
      { label: 'Logs', href: '/admin/logs' },
    ]
  }

  if (isGov) {
    return [
      { label: 'NEC Dashboard', href: '/nec' },
      { label: 'Monitoring', href: '/monitoring' },
      { label: 'Live Map', href: '/map' },
    ]
  }

  if (isAgency) {
    return [
      { label: 'DOE Dashboard', href: '/doe' },
      { label: 'History', href: '/doe/history' },
      { label: 'Monitoring', href: '/monitoring' },
      { label: 'Live Map', href: '/map' },
    ]
  }

  const nav = []
  nav.push(
    { label: 'Home', href: '/' },
    { label: 'Monitoring', href: '/monitoring' },
    { label: 'Live Map', href: '/map' },
    { label: 'History', href: '/history' },
  )
  if (isCitizen) {
    nav.push(
      { label: 'Reports', href: '/reports' },
      { label: 'Permits', href: '/permits/tracker' },
    )
  }
  if (isLguStaff) {
    nav.push({ label: 'LGU Dashboard', href: '/lgu/dashboard' })
  }
  return nav
}

LiveMap.layout = (page) => <MapLayout>{page}</MapLayout>

function MapLayout({ children }) {
  const { auth = {} } = usePage().props
  const user = auth?.user ?? null
  const unread = auth?.unreadNotifications ?? 0
  const [menuOpen, setMenuOpen] = useState(false)

  const links = buildMapNav(user)

  const isActive = (href) => window.location.pathname === href || window.location.pathname.startsWith(`${href}/`)

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="shrink-0 border-b border-brandborder bg-white/90 backdrop-blur-md z-40">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between gap-3 px-4 md:px-6">
          <Link href="/" className="flex items-center" aria-label="eWattPH home"><Logo size="h-7" /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {links.map(({ label, href }) => (
              <Link key={label} href={href} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive(href) ? 'text-primary' : 'text-textprimary hover:text-primary'}`}>{label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            {user && <NotificationBell count={unread} onClick={() => router.visit('/notifications')} />}
            {user ? (
              <>
                <Link href="/profile" className="hidden min-h-[40px] items-center rounded-lg px-3 text-sm font-medium text-textprimary transition hover:text-primary md:flex">{user.name}</Link>
                <button onClick={() => router.post('/logout')} className="hidden h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 md:inline-flex">Log out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden h-9 items-center rounded-lg px-4 text-sm font-medium text-textprimary transition hover:text-primary md:inline-flex">Log in</Link>
                <Link href="/register" className="hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90 md:inline-flex"><Zap className="h-4 w-4" /> Get Started</Link>
              </>
            )}
            <button className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-textprimary transition hover:bg-tint md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="space-y-1 border-t border-brandborder bg-white px-4 py-3 md:hidden" aria-label="Mobile navigation">
            {links.map(({ label, href }) => (
              <Link key={label} href={href} onClick={() => setMenuOpen(false)} className={`block rounded-lg px-3 py-3 text-[15px] font-medium ${isActive(href) ? 'bg-tint text-primary' : 'text-textprimary hover:bg-muted'}`}>{label}</Link>
            ))}
            {!user && (
              <>
                <hr className="my-2 border-gray-100" />
                <Link href="/login" onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 text-[15px] font-medium text-primary hover:bg-muted">Log in</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-lg bg-primary px-3 py-3 text-[15px] font-medium text-white hover:bg-primary/90"><Zap className="h-4 w-4" /> Get Started</Link>
              </>
            )}
          </nav>
        )}
      </header>
      <main className="flex-1 relative min-h-0">{children}</main>
    </div>
  )
}

export default function LiveMap() {
  const [data, setData] = useState({ reports: [], risk_zones: [] })
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [footerOpen, setFooterOpen] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setData(await (await fetch('/api/public/map')).json())
    } catch (err) {
      console.error('[LiveMap] Failed to load:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const id = setInterval(load, 60000); return () => clearInterval(id) }, [])

  const active = data.reports.filter((r) => r.status !== 'resolved').length
  const resolved = data.reports.filter((r) => r.status === 'resolved').length

  return (
    <div className="relative h-full w-full">
      <MapView reports={data.reports} riskZones={data.risk_zones} onSelectReport={setSelected} className="absolute inset-0 h-full w-full" />

      {/* ── All overlays in ONE container ── */}
      <div className="pointer-events-none absolute inset-0 z-[9999]">

        {/* Top-left: legend card — collapsible on mobile, always open on desktop */}
        <div className="pointer-events-auto absolute left-2 top-2 z-[9999] sm:left-4 sm:top-4 md:left-5 md:top-5">
          {/* Mobile: collapse toggle button */}
          <button onClick={() => setLegendOpen(!legendOpen)}
            className="mb-1.5 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-xl text-[10px] font-medium text-textprimary transition hover:bg-gray-50 sm:hidden">
            <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            {legendOpen ? 'Itago' : 'Marks'}
          </button>
          {/* Legend content — always visible on md+, toggle on mobile */}
          <div className={`${legendOpen ? 'block' : 'hidden'} sm:block`}> 
            <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-xl sm:p-3">
              <h2 className="text-[9px] font-bold uppercase tracking-wider text-textmuted mb-1.5 sm:mb-2.5 sm:text-[10px]">Ano ang mga mark?</h2>
              <ul className="space-y-1 sm:space-y-2">
                <LegendItem color="#CE1126" label="Verified" desc="Kumpirma ng LGU" />
                <LegendItem color="#F59E0B" label="Pending" desc="Hinihintay pa" />
                <LegendItem color="#10B981" label="Resolved" desc="Bumalik na ang kuryente" />
                <LegendItem color="#3B82F6" label="Auto-Detected" desc="Social media / web" pulse />
                <LegendItem color="#FCD116" label="Risk Zone" desc="Predicted brownout 48 oras" ring />
              </ul>
              <p className="mt-1.5 pt-1.5 border-t border-gray-100 text-[8px] text-textmuted leading-relaxed sm:mt-2 sm:pt-2 sm:text-[9px]">
                I-click ang mark para makita ang detalye.
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar — bottom center on mobile, bottom-right on desktop */}
        <div className="pointer-events-auto absolute bottom-2 inset-x-0 flex justify-center px-2 sm:inset-auto sm:bottom-4 sm:right-20 sm:px-0 md:bottom-5 md:right-24">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white/95 px-2 py-1.5 shadow-xl backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-2">
            <Stat icon={<Zap className="h-3 w-3 text-red-600 sm:h-4 sm:w-4" />} value={active} label="Active" color="#CE1126" />
            <Stat icon={<CheckCircle2 className="h-3 w-3 text-emerald-600 sm:h-4 sm:w-4" />} value={resolved} label="Resolved" color="#10B981" />
            <Stat icon={<AlertTriangle className="h-3 w-3 text-amber-600 sm:h-4 sm:w-4" />} value={data.risk_zones.length} label="Risk" color="#F59E0B" />
            {data.auto_detected_count > 0 && (
              <Stat icon={<Eye className="h-3 w-3 text-blue-600 sm:h-4 sm:w-4" />} value={data.auto_detected_count} label="Auto" color="#3B82F6" />
            )}
            <div className="ml-0.5 border-l border-gray-200 pl-1.5 sm:ml-1 sm:pl-2">
              <button onClick={load}
                className="flex h-6 w-6 items-center justify-center rounded-md transition hover:bg-gray-100 sm:h-7 sm:w-7"
                aria-label="Refresh map data">
                <RefreshCw className={`h-3 w-3 text-primary ${loading ? 'animate-spin' : ''} sm:h-3.5 sm:w-3.5`} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom-left: footer toggle */}
        <div className="pointer-events-auto absolute bottom-2 left-2 sm:bottom-4 sm:left-4 md:bottom-5 md:left-5">
          <button
            onClick={() => setFooterOpen(!footerOpen)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-xl text-[10px] font-medium text-textprimary transition hover:bg-gray-50 sm:gap-1.5 sm:px-3 sm:py-2.5 sm:text-xs"
          >
            {footerOpen ? <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            {footerOpen ? 'Isara' : 'Footer'}
          </button>
        </div>

        {/* Selected report card — mobile friendly */}
        {selected && (
          <div className="pointer-events-auto absolute bottom-14 left-2 w-[min(90vw,300px)] rounded-xl border border-gray-200 bg-white p-3 shadow-xl sm:bottom-16 sm:left-4 sm:w-[min(92vw,320px)] sm:p-4 md:bottom-5 md:left-1/2 md:-translate-x-1/2">
            <button onClick={() => setSelected(null)} aria-label="Close"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-textmuted hover:bg-muted text-sm sm:h-7 sm:w-7">&times;</button>
            <div className="flex items-center gap-1.5 pr-5 sm:gap-2 sm:pr-6">
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase sm:px-2 sm:text-[10px] ${
                selected.status === 'verified' ? 'bg-danger/10 text-red-700' : selected.status === 'resolved' ? 'bg-success/10 text-emerald-700' : 'bg-warning/15 text-yellow-800'}`}>
                {selected.status}
              </span>
              <span className="text-xs font-semibold sm:text-sm">#{selected.id}</span>
            </div>
            <p className="mt-1 text-[10px] text-textmuted sm:text-xs">
              {selected.lgu ?? 'Philippines'} · {selected.outage_type?.replace(/_/g, ' ')} · severity {selected.severity}/100
            </p>
            <Link href={`/reports/${selected.id}`} className="mt-2 inline-flex h-7 items-center rounded-lg bg-primary px-2.5 text-[10px] font-medium text-white transition hover:bg-primary/90 sm:mt-2.5 sm:h-8 sm:px-3 sm:text-xs">
              View details
            </Link>
          </div>
        )}
      </div>

      {/* ── Footer slide-up panel ── */}
      {footerOpen && (
        <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[10000] max-h-[50vh] overflow-y-auto rounded-t-2xl border-t border-gray-200 bg-white shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
            <span className="text-xs font-semibold text-textprimary">eWattPH</span>
            <button onClick={() => setFooterOpen(false)} className="flex h-7 w-7 items-center justify-center rounded-full text-textmuted hover:bg-muted text-sm">&times;</button>
          </div>
          <Footer />
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label, desc, mobileDesc, ring = false, pulse = false }) {
  return (
    <li className="flex items-center gap-1.5 sm:gap-2.5">
      {ring ? (
        <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-[2px] sm:h-[14px] sm:w-[14px]" style={{ borderColor: color }}><span className="h-[3px] w-[3px] rounded-full bg-current sm:h-[4px] sm:w-[4px]" style={{ color: color }} /></span>
      ) : pulse ? (
        <span className="relative inline-flex h-3 w-3 shrink-0 items-center justify-center sm:h-[14px] sm:w-[14px]">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: color, animation: 'pulse-ring 2s infinite' }} />
          <span className="relative inline-flex h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ background: color }} />
        </span>
      ) : (
        <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full sm:h-3 sm:w-3" style={{ background: color }} />
      )}
      <div className="min-w-0">
        <span className="text-[10px] font-semibold text-textprimary leading-none sm:text-[11px]">{label}</span>
        <p className="text-[8px] text-textmuted leading-snug mt-0.5 sm:text-[10px]">{desc}</p>
      </div>
    </li>
  )
}

function Stat({ icon, value, label, color }) {
  return (
    <div className="flex items-center gap-0.5 sm:gap-1.5">
      <span className="flex h-4 w-4 items-center justify-center rounded sm:h-5 sm:w-5 sm:rounded-md" style={{ background: `${color}15` }}>{icon}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xs font-extrabold tabular-nums sm:text-sm" style={{ color }}>{value}</span>
        <span className="text-[7px] font-medium text-textmuted uppercase tracking-wide sm:text-[10px]">{label}</span>
      </div>
    </div>
  )
}
