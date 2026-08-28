import { Link } from '@inertiajs/react'
import { Zap, MapPin, FileText, ShieldCheck, ChevronRight, BadgeCheck, ArrowUpRight, Brain, Users, Lock, Radar, FileCheck2, Network, MousePointerClick, Landmark, BrainCircuit } from 'lucide-react'
import Reveal from '../Components/Reveal'

/**
 * Landing page — pure system overview, e.gov.ph structure:
 * Hero → Challenge → Features → How It Works → Security → CTA.
 * Live data lives on /monitoring.
 */
export default function Home({ greeting, myReportsCount = 0, myActivePermits = 0, auth = {} }) {
  const user = auth?.user

  return (
    <div
      className="relative -mb-24 -mt-6 md:-mb-12 md:-mt-8"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
    >
      {/* ── SECTION 1 · HERO (whole first screen) ─────────────── */}
      <section
        aria-label="Hero"
        className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F0F4FF] via-[#E8EEFF]/50 to-transparent px-4 pb-12 pt-8 text-center md:pb-16 md:pt-12"
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
          <span className="hero-in inline-flex items-center gap-1.5 rounded-full border border-brandborder bg-white px-3 py-1 text-[10px] font-semibold text-primary shadow-sm sm:px-4 sm:py-1.5 sm:text-xs">
            <BadgeCheck className="h-4 w-4" /> National Energy Intelligence Platform
          </span>

          <h1 className="hero-in mx-auto mt-5 text-balance text-[2.5rem] font-bold leading-[1.1] tracking-tight text-textprimary sm:text-5xl md:mt-7 md:text-6xl lg:text-7xl" style={{ animationDelay: '100ms' }}>
            All Grid Intelligence.
            <span className="block text-primary">One Platform.</span>
          </h1>
          <p className="hero-in mx-auto mt-5 max-w-[18rem] text-sm font-light leading-[1.85] text-textmuted sm:max-w-[28rem] sm:text-base md:mt-7 md:max-w-xl md:text-lg" style={{ animationDelay: '200ms' }}>
            eWattPH connects citizens, LGUs, and national agencies into one live picture of the
            Philippine power grid — report outages, track permits, and respond faster during the energy emergency.
          </p>

          <div className="hero-in mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-3.5 md:mt-10" style={{ animationDelay: '300ms' }}>
            <Link href="/monitoring"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white shadow-xl shadow-[#0040E7]/25 transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-primary/90 sm:px-8 sm:py-3.5">
              <Radar className="h-4 w-4" /> Live Monitoring
            </Link>
            <Link href="/reports/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brandborder bg-white/90 px-6 py-3 text-sm font-medium text-primary backdrop-blur transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:bg-tint sm:px-8 sm:py-3.5">
              Report an Outage <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {user && (
            <p className="hero-in mt-10 text-sm font-medium text-textmuted" style={{ animationDelay: '400ms' }}>
              {greeting} · <span className="font-semibold text-textprimary">{myReportsCount} reports</span> filed ·{' '}
              <span className="font-semibold text-textprimary">{myActivePermits}</span> permits in process
            </p>
          )}

          <div aria-hidden="true" className="absolute inset-x-0 -bottom-2 hidden justify-center md:flex">
            <ChevronRight className="h-6 w-6 rotate-90 animate-bounce text-slate-300" />
          </div>
        </div>
      </section>

      {/* ── THE CHALLENGE ───────────────────────────────────────── */}
      <section aria-label="The challenge" className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionIntro
            kicker="The Challenge"
            title="An Energy Emergency,"
            highlight="Answered."
            sub="Thin reserves, rotational brownouts, and an aging grid — made worse by scattered information and slow, siloed government response."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          <Reveal delay={0} className="h-full">
            <FeatureCard
              icon={<Network className="h-5 w-5" />}
              title="Fragmented Information"
            >
              Outage details live in cooperative hotlines and social feeds. No agency has a single,
              nationwide, real-time picture of the grid.
            </FeatureCard>
          </Reveal>
          <Reveal delay={90} className="h-full">
            <FeatureCard
              icon={<MousePointerClick className="h-5 w-5" />}
              title="Slow, Blind Response"
            >
              By the time an outage is formally confirmed, hours have passed — and crews are
              dispatched without severity estimates or location clustering.
            </FeatureCard>
          </Reveal>
          <Reveal delay={180} className="h-full">
            <FeatureCard
              icon={<FileCheck2 className="h-5 w-5" />}
              title="Opaque Processes"
            >
              Energy permits move through fragmented agency pipelines with zero public visibility,
              and cross-agency crisis coordination happens over phone calls.
            </FeatureCard>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES / SOLUTION ─────────────────────────────────── */}
      <section aria-label="Platform features" className="bg-gradient-to-b from-transparent via-[#F0F4FF]/60 to-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionIntro
              kicker="The Solution"
              title="One Platform,"
              highlight="Every Answer."
              sub="eWattPH fuses citizen reports, AI analysis, and government workflows into a single source of truth for the power grid."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-4">
            <Reveal delay={0} className="h-full">
              <FeatureCard
                icon={<Users className="h-5 w-5" />}
                title="Crowdsourced Reporting"
                link="/reports/create"
              >
                Any citizen reports an outage in seconds — GPS auto-location, photo, outage type.
                The grid becomes observable in real time.
              </FeatureCard>
            </Reveal>
            <Reveal delay={90} className="h-full">
              <FeatureCard
                icon={<Brain className="h-5 w-5" />}
                title="AI-Driven Triage"
                link="/monitoring"
              >
                Every report is scored for severity with a probable cause and suggested actions —
                LGUs dispatch the right resources first.
              </FeatureCard>
            </Reveal>
            <Reveal delay={180} className="h-full">
              <FeatureCard
                icon={<FileCheck2 className="h-5 w-5" />}
                title="Transparent Permits"
                link="/permits/tracker"
              >
                Energy permits are AI pre-screened, routed to the right department, and tracked
                publicly from submission to decision.
              </FeatureCard>
            </Reveal>
            <Reveal delay={270} className="h-full">
              <FeatureCard
                icon={<Landmark className="h-5 w-5" />}
                title="Multi-Agency Coordination"
                link="/monitoring"
              >
                From barangay to the National Emergency Council — every level of government shares
                one scoped, audited operational picture.
              </FeatureCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section aria-label="How it works" className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <SectionIntro
            kicker="How It Works"
            title="From Report to Response"
            highlight="in Minutes."
            sub="A closed loop between citizens and government — every report feeds the map, the AI, and the response teams."
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
          <Reveal delay={0}>
            <StepCard
              number="01"
              icon={<Zap className="h-5 w-5" />}
              title="Report"
              text="A citizen pinpoints an outage on the national map with GPS, a photo, and an outage type — done in under a minute."
            />
          </Reveal>
          <Reveal delay={120}>
            <StepCard
              number="02"
              icon={<BrainCircuit className="h-5 w-5" />}
              title="AI Analyzes"
              text="The platform scores severity, predicts the probable cause, and suggests actions — instantly, on every submission."
            />
          </Reveal>
          <Reveal delay={240}>
            <StepCard
              number="03"
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Government Responds"
              text="LGU teams verify, dispatch, and resolve. Agencies coordinate on the same live picture, and the public sees progress."
            />
          </Reveal>
        </div>

        <Reveal delay={200}>
          <div className="mt-12 text-center">
            <Link href="/monitoring"
              className="inline-flex items-center gap-2 rounded-lg border border-brandborder bg-white px-6 py-3 text-sm font-medium text-primary transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:border-primary/40 hover:bg-tint">
              See it live on the Monitoring dashboard <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── SECURITY ────────────────────────────────────────────── */}
      <section aria-label="Security and trust" className="bg-gradient-to-b from-transparent via-[#F0F4FF]/60 to-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-8 md:py-28">
          <Reveal>
            <SectionIntro
              kicker="Security"
              title="Government-Grade,"
              highlight="Audited."
              sub="Built for the public sector from day one — every action traceable, every scope enforced, every record protected."
            />
          </Reveal>

          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3">
            <Reveal delay={0} className="h-full">
              <FeatureCard icon={<Lock className="h-5 w-5" />} title="Encrypted and Audited">
                Critical actions — verifications, dispatches, permit decisions, role changes — are
                written to an immutable audit log with actor and IP.
              </FeatureCard>
            </Reveal>
            <Reveal delay={90} className="h-full">
              <FeatureCard icon={<ShieldCheck className="h-5 w-5" />} title="Strict Role Scoping">
                Nine government-aligned roles with enforced boundaries: LGU staff only act within
                their municipality; agencies only within their domain.
              </FeatureCard>
            </Reveal>
            <Reveal delay={180} className="h-full">
              <FeatureCard icon={<Radar className="h-5 w-5" />} title="Privacy-First AI">
                User content is sanitized before reaching AI models, no personal data leaves the
                platform, and citizens can export or review their data anytime.
              </FeatureCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA BAND (contained) ────────────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <Reveal>
          <section aria-label="Call to action" className="rounded-3xl bg-primary px-6 py-16 text-center text-white shadow-2xl shadow-[#0040E7]/25 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                Your Power Grid, <span className="text-accent">In Your Pocket.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-sm font-light leading-[1.85] text-blue-100 md:text-[15px]">
                Join thousands of citizens mapping the national grid in real time. Free for every Filipino, nationwide.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {!user && (
                  <Link href="/register"
                    className="inline-flex h-12 items-center rounded-lg bg-accent px-8 text-sm font-semibold text-[#1A1A2E] shadow-lg transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:brightness-95">
                    Get Started — It's Free
                  </Link>
                )}
                <Link href="/monitoring"
                  className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/30 px-8 text-sm font-medium text-white transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-white/10">
                  Open Live Monitoring
                </Link>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  )
}

/* ── e.gov.ph section intro ─────────────────────────────────── */
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

/* ── Minimal white card, #FEF2F2 chip, glass hover ──────────── */
function FeatureCard({ icon, title, children, link }) {
  const body = (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#CE1126]">{icon}</div>
      <h3 className="mt-6 text-lg font-bold tracking-tight text-textprimary">{title}</h3>
      <p className="mt-2.5 text-sm leading-[1.75] text-slate-600">{children}</p>
      {link && (
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition duration-500 group-hover:opacity-100">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      )}
    </>
  )

  const cls = `group flex h-full w-full flex-col rounded-2xl border border-gray-200/80 bg-white p-8 text-left transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/50 hover:shadow-xl hover:shadow-[#0040E7]/5 hover:backdrop-blur-md`

  return link ? (
    <Link href={link} className={cls}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  )
}

/* ── Numbered step card ─────────────────────────────────────── */
function StepCard({ number, icon, title, text }) {
  return (
    <div className="relative flex h-full w-full flex-col rounded-2xl border border-gray-200/80 bg-white p-8 text-left transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-primary/20 hover:bg-white/50 hover:shadow-xl hover:shadow-[#0040E7]/5 hover:backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#CE1126]">{icon}</div>
        <span className="text-4xl font-bold tracking-tight text-[#FEF2F2] [-webkit-text-stroke:1px_#CE1126]/30" aria-hidden="true"
          style={{ WebkitTextStroke: '1px rgba(206,17,38,.25)', color: '#FEF2F2' }}>{number}</span>
      </div>
      <h3 className="mt-6 text-lg font-bold tracking-tight text-textprimary">{title}</h3>
      <p className="mt-2.5 text-sm leading-[1.75] text-slate-600">{text}</p>
    </div>
  )
}
