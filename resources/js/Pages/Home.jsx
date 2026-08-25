import { Link } from '@inertiajs/react'
import { Zap, MapPin, FileText, ShieldCheck, ChevronRight, BadgeCheck, AlertTriangle, ArrowUpRight, Radio } from 'lucide-react'

/**
 * Homepage — e.gov.ph visual language:
 * full-screen hero → centered section intros + soft tinted cards → contained CTA.
 */
export default function Home({ greeting, metrics = {}, announcements = [], riskZones = [], myReportsCount = 0, myActivePermits = 0, auth = {} }) {
  const user = auth?.user

  return (
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

      {/* ── SECTION 2 · REAL-TIME GRID HEALTH ──────────────────── */}
      <div className="mx-auto w-full max-w-7xl space-y-24 px-4 py-20 md:space-y-28 md:px-8 md:py-28">
      <section aria-label="Live power status">
        <SectionIntro
          kicker="Real-Time"
          title="National Power,"
          highlight="Live."
          sub="Every number below comes from citizens on the ground — verified by LGUs and updated as the grid responds."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 md:mt-16 md:gap-7">
          <StatTile
            tone="bg-emerald-50/80"
            chip="bg-emerald-100 text-emerald-600"
            icon={<ShieldCheck className="h-5 w-5" />}
            label="Power Reliability"
            value={`${metrics.power_reliability ?? '–'}%`}
            note={metrics.power_reliability >= 95 ? 'Grid stable nationwide' : 'Monitor load levels'}
          />
          <StatTile
            tone="bg-red-50/80"
            chip="bg-red-100 text-red-600"
            icon={<Zap className="h-5 w-5" />}
            label="Active Outages"
            value={metrics.active_outages ?? 0}
            note="Being responded to by LGU teams"
          />
          <StatTile
            tone="bg-[#F0F4FF]"
            chip="bg-[#E0E9FF] text-primary"
            icon={<MapPin className="h-5 w-5" />}
            label="Citizen Reports"
            value={metrics.reports_24h ?? 0}
            note="Submitted in the last 24 hours"
          />
          <StatTile
            tone="bg-emerald-50/80"
            chip="bg-emerald-100 text-emerald-600"
            icon={<FileText className="h-5 w-5" />}
            label="Resolved Today"
            value={metrics.resolved_today ?? 0}
            note="Power restored and verified"
          />
        </div>
      </section>

      {/* ── SECTION 3 · AI RISK FORECAST ───────────────────────── */}
      {riskZones.length > 0 && (
        <section aria-label="AI risk zones">
          <SectionIntro
            kicker="AI Analytics"
            title="Outage Risks,"
            highlight="Predicted."
            sub="Our predictive model analyzes citizen reports, grid load, and historical patterns to flag high-risk areas 48 hours ahead."
          />

          <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-6 md:mt-16">
            {riskZones.map((z, i) => (
              <article key={i}
                className="group flex w-full max-w-sm flex-col rounded-2xl bg-amber-50/70 p-8 text-left transition duration-300 hover:-translate-y-1 hover:bg-amber-50 hover:shadow-xl hover:shadow-amber-500/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100/80 text-amber-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <RiskChip level={z.risk_level} />
                </div>

                <h3 className="mt-5 text-lg font-bold tracking-tight text-textprimary">{z.province}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">{z.region}</p>
                <p className="mt-3 flex-1 text-sm leading-[1.75] text-slate-600">{z.predicted_cause}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── SECTION 4 · ADVISORIES ─────────────────────────────── */}
      <section id="announcements" aria-label="Recent announcements">
        <SectionIntro
          kicker="Government"
          title="Advisories,"
          highlight="Transparent."
          sub="Official announcements from DOE, DOLE, NGCP, and LGUs — published straight to the public, no middleman."
        />

        <div className="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-6 md:mt-16">
          {announcements.length === 0 && (
            <p className="w-full rounded-2xl bg-tint px-6 py-10 text-center text-sm text-textmuted">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <article key={a.id} className="flex w-full max-w-md flex-col rounded-2xl bg-tint/70 p-8 text-left transition duration-300 hover:-translate-y-1 hover:bg-tint hover:shadow-xl hover:shadow-[#0040E7]/10">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  a.severity === 'critical' ? 'bg-red-100 text-red-700' : a.severity === 'warning' ? 'bg-amber-100 text-yellow-800' : 'bg-[#E0E9FF] text-primary'}`}>
                  {a.source}
                </span>
                {a.severity !== 'info' && (
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                    a.severity === 'critical' ? 'text-red-600' : 'text-yellow-700'}`}>
                    <AlertTriangle className="h-3.5 w-3.5" /> {a.severity} advisory
                  </span>
                )}
              </div>

              <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight text-textprimary">{a.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-[1.8] text-slate-600">{a.body}</p>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#0040E71A] pt-4">
                <time className="text-xs text-slate-400">{a.published_at}</time>
                <Link href="/map" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                  View affected areas <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
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

/* ── e.gov.ph section intro: centered kicker + big title w/ blue span + sub ── */
function SectionIntro({ kicker, title, highlight, sub }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{kicker}</span>
      <h2 className="mt-4 text-balance text-3xl font-bold leading-tight tracking-tight text-textprimary md:text-[2.75rem] md:leading-[1.15]">
        {title} <span className="text-primary">{highlight}</span>
      </h2>
      {sub && <p className="mt-5 text-[15px] leading-[1.85] text-textmuted md:text-base">{sub}</p>}
    </div>
  )
}

/* ── Soft tinted stat tile (e.gov.ph feature-card style) ───── */
function StatTile({ icon, tone, chip, label, value, note }) {
  return (
    <div className={`rounded-2xl ${tone} p-8 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${chip} shadow-sm`}>{icon}</div>
      <div className="mt-5 text-4xl font-bold tracking-tight text-textprimary">{value}</div>
      <h3 className="mt-2 text-sm font-semibold text-textprimary">{label}</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">{note}</p>
    </div>
  )
}

function RiskChip({ level }) {
  const map = {
    critical: ['bg-red-100 text-red-700', 'Critical'],
    high: ['bg-amber-200 text-amber-800', 'High'],
    medium: ['bg-amber-100 text-yellow-800', 'Medium'],
    low: ['bg-emerald-100 text-emerald-700', 'Low'],
  }
  const [cls, label] = map[level] || map.low
  return <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${cls}`}>{label}</span>
}

