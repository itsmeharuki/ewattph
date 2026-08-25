import { Link } from '@inertiajs/react'
import { Zap, MapPin, FileText, ShieldCheck, ChevronRight, BadgeCheck, AlertTriangle, ArrowUpRight, Radio } from 'lucide-react'

/**
 * Homepage — e.gov.ph structure:
 * full-screen hero → premium dashboard panels → contained CTA.
 */
export default function Home({ greeting, metrics = {}, announcements = [], riskZones = [], myReportsCount = 0, myActivePermits = 0, auth = {} }) {
  const user = auth?.user

  return (
    // Escape the centered shell horizontally so bands span the whole screen
    <div
      className="relative -mb-24 -mt-6 md:-mb-12 md:-mt-8"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
    >
      {/* ── SECTION 1 · HERO (whole first screen) ─────────────── */}
      <section
        aria-label="Hero"
        className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F0F4FF] via-[#E8EEFF]/50 to-transparent px-4 py-16 text-center"
      >
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[.35]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,64,231,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,64,231,.05) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }}
        />

        <div className="relative mx-auto w-full max-w-4xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brandborder bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <BadgeCheck className="h-4 w-4" /> National Energy Intelligence Platform
          </span>

          <h1 className="mx-auto mt-7 text-balance text-5xl font-bold leading-[1.1] tracking-tight text-textprimary md:text-6xl lg:text-7xl">
            All Grid Intelligence.
            <span className="block text-primary">One Platform.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-base font-light leading-[1.85] text-textmuted md:text-lg">
            Filipino citizens deserve real-time answers during the energy emergency. Report outages,
            track permits, and see government response — live on one national map.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
            <Link href="/reports/create"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-medium text-white shadow-xl shadow-[#0040E7]/25 transition hover:bg-primary/90">
              <Zap className="h-4 w-4" /> Report an Outage
            </Link>
            <Link href="/map"
              className="inline-flex items-center gap-2 rounded-lg border border-brandborder bg-white/90 px-8 py-3.5 text-sm font-medium text-primary backdrop-blur transition hover:border-primary/40 hover:bg-tint">
              View Live Map <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {user && (
            <p className="mt-10 text-sm font-medium text-textmuted">
              {greeting} · <span className="font-semibold text-textprimary">{myReportsCount} reports</span> filed ·{' '}
              <span className="font-semibold text-textprimary">{myActivePermits}</span> permits in process
            </p>
          )}

          <div aria-hidden="true" className="absolute inset-x-0 -bottom-2 hidden justify-center md:flex">
            <ChevronRight className="h-6 w-6 rotate-90 animate-bounce text-slate-300" />
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PANELS (constrained) ─────────────────────── */}
      <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-16 md:px-8">
        {/* ═══ PANEL 1 · GRID HEALTH STRIP ═══ */}
        <section aria-label="Live power status">
          <SectionHead
            kicker="Real-time"
            title="National Power Status"
            meta={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Radio className="h-3 w-3 animate-pulse" /> Live
              </span>
            }
          />

          <div className="mt-8 overflow-hidden rounded-2xl border border-brandborder bg-card shadow-sm">
            <div className="grid grid-cols-1 divide-y divide-[#0040E71A] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
              <Cell
                icon={<ShieldCheck className="h-4.5 w-4.5" />}
                tone="text-emerald-600 bg-emerald-50"
                label="Power Reliability"
                value={`${metrics.power_reliability ?? '–'}%`}
                note={metrics.power_reliability >= 95 ? 'Grid stable' : 'Monitor load levels'}
              />
              <Cell
                icon={<Zap className="h-4.5 w-4.5" />}
                tone="text-danger bg-red-50"
                label="Active Outages"
                value={metrics.active_outages ?? 0}
                note="Being responded to"
              />
              <Cell
                icon={<MapPin className="h-4.5 w-4.5" />}
                tone="text-primary bg-tint"
                label="Reports · 24 hours"
                value={metrics.reports_24h ?? 0}
                note="Citizen-submitted nationwide"
              />
              <Cell
                icon={<FileText className="h-4.5 w-4.5" />}
                tone="text-emerald-600 bg-emerald-50"
                label="Resolved Today"
                value={metrics.resolved_today ?? 0}
                note="Power restored"
              />
            </div>
          </div>
        </section>

        {/* ═══ PANEL 2 · RISK WATCHLIST ═══ */}
        {riskZones.length > 0 && (
          <section aria-label="AI risk zones">
            <SectionHead
              kicker="AI Analytics"
              title="48-Hour Risk Forecast"
              meta={<span className="text-xs font-medium text-textmuted">Predictive model · refreshes daily</span>}
            />

            <div className="mt-8 overflow-hidden rounded-2xl border border-brandborder bg-card shadow-sm">
              {riskZones.map((z, i) => (
                <div key={i}
                  className={`flex flex-col gap-4 px-6 py-5 transition hover:bg-muted md:flex-row md:items-center ${i > 0 ? 'border-t border-[#0040E71A]' : ''}`}>
                  {/* Level indicator */}
                  <div className={`hidden h-12 w-1 shrink-0 rounded-full sm:block ${meterColor(z.risk_level)}`} aria-hidden="true" />

                  {/* Place */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold tracking-tight text-textprimary">{z.province}</h3>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-textmuted">{z.region}</span>
                    </div>
                    <p className="mt-1 text-sm leading-[1.65] text-textmuted">{z.predicted_cause}</p>
                  </div>

                  {/* Meter */}
                  <div className="flex shrink-0 items-center gap-3.5 md:w-52">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100" role="meter" aria-valuenow={meterPct(z.risk_level)} aria-valuemin={0} aria-valuemax={100} aria-label={`${z.province} risk: ${z.risk_level}`}>
                      <div className={`h-full rounded-full ${meterColor(z.risk_level)}`} style={{ width: `${meterPct(z.risk_level)}%` }} />
                    </div>
                    <RiskChip level={z.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ PANEL 3 · ADVISORY FEED ═══ */}
        <section id="announcements" aria-label="Recent announcements">
          <SectionHead
            kicker="Government"
            title="Advisories & Announcements"
            meta={
              <Link href="#announcements" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Feed archive <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            }
          />

          <div className="mt-8 overflow-hidden rounded-2xl border border-brandborder bg-card shadow-sm">
            {announcements.length === 0 && (
              <p className="px-6 py-10 text-center text-sm text-textmuted">No announcements yet.</p>
            )}
            {announcements.map((a, i) => (
              <article key={a.id} className={`relative px-6 py-6 transition hover:bg-muted md:px-8 ${i > 0 ? 'border-t border-[#0040E71A]' : ''}`}>
                {/* timeline dot */}
                <span aria-hidden="true" className={`absolute left-[13px] top-9 hidden h-2 w-2 rounded-full ring-4 md:block ${
                  a.severity === 'critical' ? 'bg-danger ring-danger/10' : a.severity === 'warning' ? 'bg-warning ring-warning/15' : 'bg-primary ring-primary/10'}`} />

                <div className="md:pl-8">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                      a.severity === 'critical' ? 'bg-danger/10 text-red-700' : a.severity === 'warning' ? 'bg-warning/15 text-yellow-800' : 'bg-primary/10 text-primary'}`}>
                      {a.source}
                    </span>
                    {a.severity !== 'info' && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${
                        a.severity === 'critical' ? 'text-danger' : 'text-yellow-700'}`}>
                        <AlertTriangle className="h-3 w-3" /> {a.severity} advisory
                      </span>
                    )}
                    <time className="ml-auto text-xs text-slate-400">{a.published_at}</time>
                  </div>

                  <h3 className="mt-2.5 text-[15px] font-semibold leading-snug tracking-tight text-textprimary">{a.title}</h3>
                  <p className="mt-1.5 max-w-4xl text-sm leading-[1.75] text-textmuted">{a.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ── CTA BAND (contained) ────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <section aria-label="Call to action" className="rounded-3xl bg-primary px-6 py-16 text-center text-white shadow-2xl shadow-[#0040E7]/25 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Your Power Grid, <span className="text-accent">In Your Pocket.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm font-light leading-[1.85] text-blue-100 md:text-[15px]">
              Join thousands of citizens mapping the national grid in real time. Free for every Filipino, nationwide.
            </p>
            {!user && (
              <Link href="/register"
                className="mt-8 inline-flex h-12 items-center rounded-lg bg-accent px-8 text-sm font-semibold text-[#1A1A2E] shadow-lg transition hover:brightness-95">
                Get Started — It's Free
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ── Panel building blocks ─────────────────────────────────── */

function SectionHead({ kicker, title, meta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{kicker}</span>
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-textprimary md:text-[1.75rem]">{title}</h2>
      </div>
      {meta}
    </div>
  )
}

function Cell({ icon, tone, label, value, note }) {
  return (
    <div className="group p-6 transition-colors duration-200 hover:bg-muted/60 lg:p-7">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-textmuted">{label}</span>
      </div>
      <div className="mt-4 text-4xl font-bold tracking-tight text-textprimary transition-transform duration-200 group-hover:translate-x-0.5">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{note}</div>
    </div>
  )
}

function RiskChip({ level }) {
  const map = {
    critical: ['bg-danger text-white', 'Critical'],
    high: ['bg-warning text-white', 'High'],
    medium: ['bg-accent/30 text-yellow-800', 'Medium'],
    low: ['bg-success/10 text-emerald-700', 'Low'],
  }
  const [cls, label] = map[level] || map.low
  return <span className={`w-20 shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-bold capitalize ${cls}`}>{label}</span>
}

const meterPct = (level) => ({ critical: 100, high: 82, medium: 58, low: 28 }[level] ?? 28)
const meterColor = (level) => ({ critical: 'bg-danger', high: 'bg-warning', medium: 'bg-accent', low: 'bg-success' }[level] ?? 'bg-success')

function StatCard() { return null }
