import { Link } from '@inertiajs/react'
import { Zap, MapPin, FileText, ShieldCheck, ChevronRight, AlertTriangle, ArrowUpRight, Radio, Radar } from 'lucide-react'
import Reveal from '../../Components/Reveal'

/**
 * Public monitoring dashboard — live grid health, AI risk forecast,
 * and government advisories. No authentication required.
 */
export default function MonitoringIndex({ metrics = {}, announcements = [], riskZones = [] }) {
  return (
    <div
      className="relative -mb-24 -mt-6 md:-mb-12 md:-mt-8"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
    >
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F4FF] via-[#E8EEFF]/50 to-transparent px-4 pb-12 pt-14 text-center md:pb-16 md:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brandborder bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <Radar className="h-4 w-4" /> Public Monitoring Dashboard
          </span>
          <h1 className="hero-in mt-5 text-balance text-4xl font-bold tracking-tight text-textprimary md:text-5xl">
            The Grid, <span className="text-primary">Right Now.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.85] text-textmuted">
            Live power status, AI risk forecasts, and official advisories — open to every Filipino,
            updated as government responds.
          </p>
          <Link href="/map"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#0040E7]/25 transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-primary/90">
            Open the Live Map <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── PANELS ──────────────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl space-y-24 px-4 py-16 md:space-y-28 md:px-8 md:py-20">
        {/* ═══ GRID HEALTH ═══ */}
        <section aria-label="Live power status">
          <Reveal>
            <SectionHead
              kicker="Real-Time"
              title="National Power Status"
              meta={
                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Radio className="h-3 w-3 soft-pulse" /> Live
                </span>
              }
            />
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-7">
            <Reveal delay={0}>
              <StatTile
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Power Reliability"
                value={`${metrics.power_reliability ?? '–'}%`}
                note={metrics.power_reliability >= 95 ? 'Grid stable nationwide' : 'Monitor load levels'}
              />
            </Reveal>
            <Reveal delay={90}>
              <StatTile
                icon={<Zap className="h-5 w-5" />}
                label="Active Outages"
                value={metrics.active_outages ?? 0}
                note="Being responded to by LGU teams"
              />
            </Reveal>
            <Reveal delay={180}>
              <StatTile
                icon={<MapPin className="h-5 w-5" />}
                label="Citizen Reports"
                value={metrics.reports_24h ?? 0}
                note="Submitted in the last 24 hours"
              />
            </Reveal>
            <Reveal delay={270}>
              <StatTile
                icon={<FileText className="h-5 w-5" />}
                label="Resolved Today"
                value={metrics.resolved_today ?? 0}
                note="Power restored and verified"
              />
            </Reveal>
          </div>
        </section>

        {/* ═══ AI RISK FORECAST ═══ */}
        {riskZones.length > 0 && (
          <section aria-label="AI risk zones">
            <Reveal>
              <SectionHead
                kicker="AI Analytics"
                title="48-Hour Risk Forecast"
                meta={<span className="text-xs font-medium text-textmuted">Predictive model · refreshes daily</span>}
              />
            </Reveal>

            <div className="mt-12 flex max-w-5xl flex-wrap justify-center gap-6">
              {riskZones.map((z, i) => (
                <Reveal key={i} delay={i * 90} className="w-full max-w-sm">
                  <article className="group flex h-full w-full flex-col rounded-2xl border border-gray-200/80 bg-white p-8 text-left transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/50 hover:shadow-xl hover:shadow-[#0040E7]/5 hover:backdrop-blur-md">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#CE1126]">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <RiskChip level={z.risk_level} />
                    </div>
                    <h3 className="mt-5 text-lg font-bold tracking-tight text-textprimary">{z.province}</h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{z.region}</p>
                    <p className="mt-3 flex-1 text-sm leading-[1.75] text-slate-600">{z.predicted_cause}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* ═══ ADVISORY FEED ═══ */}
        <section id="announcements" aria-label="Recent announcements">
          <Reveal>
            <SectionHead
              kicker="Government"
              title="Advisories & Announcements"
              meta={<span className="text-xs font-medium text-textmuted">Published straight to the public</span>}
            />
          </Reveal>

          <div className="mt-12 flex max-w-5xl flex-wrap justify-center gap-6">
            {announcements.length === 0 && (
              <p className="w-full rounded-2xl border border-gray-200/80 bg-white px-6 py-10 text-center text-sm text-textmuted">No announcements yet.</p>
            )}
            {announcements.map((a, i) => (
              <Reveal key={a.id} delay={i * 90} className="w-full max-w-md">
                <article className="group flex h-full w-full flex-col rounded-2xl border border-gray-200/80 bg-white p-8 text-left transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/50 hover:shadow-xl hover:shadow-[#0040E7]/5 hover:backdrop-blur-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-md bg-[#FEF2F2] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#CE1126]">
                      {a.source}
                    </span>
                    {a.severity !== 'info' && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#CE1126]">
                        <AlertTriangle className="h-3.5 w-3.5" /> {a.severity} advisory
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-textprimary">{a.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-[1.8] text-slate-600">{a.body}</p>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
                    <time className="text-xs text-slate-400">{a.published_at}</time>
                    <Link href="/map" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      View affected areas <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function SectionHead({ kicker, title, meta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{kicker}</span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-textprimary md:text-3xl">{title}</h2>
      </div>
      {meta}
    </div>
  )
}

function StatTile({ icon, label, value, note }) {
  return (
    <div className="h-full rounded-2xl border border-gray-200/80 bg-white p-8 transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/50 hover:shadow-xl hover:shadow-[#0040E7]/5 hover:backdrop-blur-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#CE1126]">{icon}</div>
      <div className="mt-6 text-4xl font-bold tracking-tight text-textprimary">{value}</div>
      <h3 className="mt-2 text-sm font-semibold text-textprimary">{label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{note}</p>
    </div>
  )
}

function RiskChip({ level }) {
  const map = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }
  return (
    <span className="rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-bold capitalize text-[#CE1126]">
      {map[level] ?? 'Low'}
    </span>
  )
}
