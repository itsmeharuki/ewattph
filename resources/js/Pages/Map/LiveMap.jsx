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
      { label: 'Monitoring', href: '/monitoring' },
      { label: 'Live Map', href: '/map' },
    ]
  }

  const nav = []
  nav.push(
    { label: 'Home', href: '/' },
    { label: 'Monitoring', href: '/monitoring' },
    { label: 'Live Map', href: '/map' },
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
  if (isAgency) {
    nav.push({ label: 'Permits', href: '/permits/tracker' })
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
                <Link href="/register" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-white transition hover:bg-primary/90"><Zap className="h-4 w-4" /> Get Started</Link>
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

      {/* ── All overlays in ONE container, above Leaflet's z-index ── */}
      <div className="pointer-events-none absolute inset-0 z-[9999]">

        {/* Top-left: legend card */}
        <div className="pointer-events-auto absolute left-4 top-4 md:left-5 md:top-5">
          <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-textmuted mb-2.5">Ano ang mga mark?</h2>
            <ul className="space-y-2">
              <LegendItem color="#CE1126" label="Verified" desc="Brownout na kumpirma ng LGU" />
              <LegendItem color="#F59E0B" label="Pending" desc="Bagong report, hinihintay pa ang verification" />
              <LegendItem color="#10B981" label="Resolved" desc="Bumalik na ang kuryente sa lugar" />
              <LegendItem color="#3B82F6" label="Auto-Detected" desc="Nakita sa social media / web" pulse />
              <LegendItem color="#FCD116" label="Risk Zone" desc="Predicted brownout sa susunod na 48 oras" ring />
            </ul>
            <p className="mt-2 pt-2 border-t border-gray-100 text-[9px] text-textmuted leading-relaxed">
              I-click ang anumang mark para makita ang detalye.
            </p>
          </div>
        </div>

        {/* Bottom-right: stats + refresh */}
        <div className="pointer-events-auto absolute bottom-4 right-20 flex items-center gap-2 md:bottom-5 md:right-24">
          <div className="flex gap-2">
            <Stat icon={<Zap className="h-4 w-4 text-red-600" />} value={active} label="Active" color="#CE1126" />
            <Stat icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} value={resolved} label="Resolved" color="#10B981" />
            <Stat icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} value={data.risk_zones.length} label="Risk" color="#F59E0B" />
            {data.auto_detected_count > 0 && (
              <Stat icon={<Eye className="h-4 w-4 text-blue-600" />} value={data.auto_detected_count} label="Auto" color="#3B82F6" />
            )}
          </div>
          <button onClick={load}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-xl transition hover:bg-gray-50"
            aria-label="Refresh map data">
            <RefreshCw className={`h-4 w-4 text-primary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Bottom-left: footer toggle */}
        <div className="pointer-events-auto absolute bottom-4 left-4 md:bottom-5 md:left-5">
          <button
            onClick={() => setFooterOpen(!footerOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-xl text-xs font-medium text-textprimary transition hover:bg-gray-50"
          >
            {footerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            {footerOpen ? 'Isara' : 'Footer'}
          </button>
        </div>

        {/* Selected report card */}
        {selected && (
          <div className="pointer-events-auto absolute bottom-16 left-4 w-[min(92vw,320px)] rounded-xl border border-gray-200 bg-white p-4 shadow-xl md:bottom-5 md:left-1/2 md:-translate-x-1/2">
            <button onClick={() => setSelected(null)} aria-label="Close"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full text-textmuted hover:bg-muted text-sm">&times;</button>
            <div className="flex items-center gap-2 pr-6">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                selected.status === 'verified' ? 'bg-danger/10 text-red-700' : selected.status === 'resolved' ? 'bg-success/10 text-emerald-700' : 'bg-warning/15 text-yellow-800'}`}>
                {selected.status}
              </span>
              <span className="text-sm font-semibold">#{selected.id}</span>
            </div>
            <p className="mt-1 text-xs text-textmuted">
              {selected.lgu ?? 'Philippines'} · {selected.outage_type?.replace(/_/g, ' ')} · severity {selected.severity}/100
            </p>
            <Link href={`/reports/${selected.id}`} className="mt-2.5 inline-flex h-8 items-center rounded-lg bg-primary px-3 text-xs font-medium text-white transition hover:bg-primary/90">
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

function LegendItem({ color, label, desc, ring = false, pulse = false }) {
  return (
    <li className="flex items-center gap-2.5">
      {ring ? (
        <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border-[2px]" style={{ borderColor: color }}><span className="h-[4px] w-[4px] rounded-full bg-current" style={{ color: color }} /></span>
      ) : pulse ? (
        <span className="relative inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-40" style={{ background: color, animation: 'pulse-ring 2s infinite' }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        </span>
      ) : (
        <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
      )}
      <div className="min-w-0">
        <span className="text-[11px] font-semibold text-textprimary leading-none">{label}</span>
        <p className="text-[10px] text-textmuted leading-snug mt-0.5">{desc}</p>
      </div>
    </li>
  )
}

function Stat({ icon, value, label, color }) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 shadow-xl">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${color}15` }}>{icon}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-extrabold tabular-nums" style={{ color }}>{value}</span>
        <span className="text-[10px] font-medium text-textmuted uppercase tracking-wide">{label}</span>
      </div>
    </div>
  )
}
