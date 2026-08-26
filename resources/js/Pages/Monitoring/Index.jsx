import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { Zap, MapPin, FileText, ShieldCheck, AlertTriangle, ArrowUpRight, Radio, Radar, ThumbsUp, Megaphone, Activity } from 'lucide-react'
import Reveal from '../../Components/Reveal'
import LocationPicker from '../../Components/LocationPicker'

/**
 * Public monitoring — social-feed style for everyday Filipino citizens:
 * one centered feed, big touch targets, plain Taglish copy, filter chips.
 * Flexible scope: national view or per-LGU via the location picker.
 */
export default function MonitoringIndex({ metrics = {}, announcements = [], riskZones = [], selectedLgu = null }) {
  const [tab, setTab] = useState('all')

  const show = (key) => tab === 'all' || tab === key

  const tabs = [
    { key: 'all', label: ' Lahat ', icon: Radio },
    { key: 'status', label: 'Power Status', icon: Activity },
    { key: 'risks', label: 'Risk Alerts', icon: AlertTriangle },
    { key: 'advisories', label: 'Announcements', icon: Megaphone },
  ]

  const scopeLabel = selectedLgu ? `${selectedLgu.name}, ${selectedLgu.province}` : 'Buong Pilipinas'

  const handleLocationChange = (lgu) => {
    router.get('/monitoring', lgu ? { lgu_id: lgu.id } : {}, { preserveState: true, preserveScroll: true })
  }

  return (
    <div
      className="relative -mb-24 -mt-6 md:-mb-12 md:-mt-8"
      style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}
    >
      {/* ── FRIENDLY HEADER ─────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#F0F4FF] via-[#E8EEFF]/50 to-transparent px-4 pb-6 pt-14 text-center md:pt-20">
        {/* decorative blurs — clipped in their own layer so the dropdown is never cut off */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brandborder bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-sm">
            <Radar className="h-4 w-4" /> Live Monitoring
          </span>
          <h1 className="hero-in mt-5 text-balance text-4xl font-bold tracking-tight text-textprimary md:text-5xl">
            Kumusta! <span className="text-primary">Here's your power update.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-[1.85] text-textmuted">
            {selectedLgu
              ? `Naka-focus sa ${selectedLgu.name}, ${selectedLgu.province} — piliin ang ibang LGU saibaba.`
              : 'Simple, real-time na impormasyon tungkol sa kuryente sa buong Pilipinas — piliin ang inyong LGU sa ibaba.'}
          </p>

          {/* LGU location picker — PSGC API autocomplete */}
          <div className="mt-6">
            <LocationPicker value={selectedLgu} onChange={handleLocationChange} />
          </div>
        </div>
      </section>

      {/* ── FEED COLUMN (social-app width) ──────────────────────── */}
      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 pb-16">
        {/* Composer-style quick action — "What's on your mind?" pattern */}
        <Reveal>
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:border-primary/20 hover:shadow-lg hover:shadow-[#0040E7]/5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] text-[#CE1126]">
              <Zap className="h-5 w-5" />
            </div>
            <p className="flex-1 text-sm font-medium text-textmuted">
              Naranasan mo ba ang brownout sa inyong lugar?
            </p>
            <Link href={`/reports/create${selectedLgu ? `?lgu_id=${selectedLgu.id}` : ''}`}
              className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-md shadow-[#0040E7]/25 transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:bg-primary/90">
              Report Now
            </Link>
          </div>
        </Reveal>

        {/* Filter chips — social app style */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-2" role="tablist" aria-label="Filter feed">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition duration-300 ${
                tab === key
                  ? 'border-primary bg-primary text-white shadow-md shadow-[#0040E7]/20'
                  : 'border-gray-200/80 bg-white/90 text-textmuted backdrop-blur hover:border-primary/30 hover:text-primary'}`}>
              <Icon className="h-4 w-4" /> {label.trim()}
            </button>
          ))}
        </div>

        {/* ═══ POWER STATUS — one big friendly card ═══ */}
        {show('status') && (
          <Reveal>
            <article className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
              {/* post header */}
              <div className="flex items-center gap-3 px-5 pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF2F2] text-[#CE1126]">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-textprimary">Power Status Ngayon</h2>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="inline-block h-2 w-2 rounded-full bg-primary soft-pulse" /> Live · {scopeLabel}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-4">
                {/* hero metric */}
                <p className="text-sm text-textmuted">Gaano ka-stable ang kuryente {selectedLgu ? `sa ${selectedLgu.name}` : 'sa buong bansa'} ngayon?</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-bold tracking-tight text-textprimary">{metrics.power_reliability ?? '–'}%</span>
                  <span className={`mb-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${metrics.power_reliability >= 95 ? 'bg-tint text-primary' : 'bg-[#FEF2F2] text-[#CE1126]'}`}>
                    {metrics.power_reliability >= 95 ? 'Stable' : 'Monitor'}
                  </span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={metrics.power_reliability} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${metrics.power_reliability ?? 0}%` }} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Ibig sabihin: sa bawat 100 na bahay, <strong className="text-textprimary">{metrics.power_reliability ?? '–'}</strong> ang may kuryente sa kasalukuyan.
                </p>

                {/* mini stats row */}
                <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-100">
                  <MiniStat icon={<Zap className="h-4 w-4 text-primary" />} value={metrics.active_outages ?? 0} label="Brownout ngayon" />
                  <MiniStat icon={<MapPin className="h-4 w-4 text-primary" />} value={metrics.reports_24h ?? 0} label="Reports (24 oras)" />
                  <MiniStat icon={<FileText className="h-4 w-4 text-primary" />} value={metrics.resolved_today ?? 0} label="Naayos ngayon" />
                </div>

                {/* post actions */}
                <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                  <Link href="/map" className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-gray-200 text-sm font-semibold text-textprimary transition hover:border-primary/30 hover:text-primary">
                    <MapPin className="h-4 w-4" /> Tingnan sa Mapa
                  </Link>
                  <Link href={`/reports/create${selectedLgu ? `?lgu_id=${selectedLgu.id}` : ''}`} className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#FEF2F2] text-sm font-semibold text-[#CE1126] transition hover:brightness-95">
                    <Zap className="h-4 w-4" /> Mag-report
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        )}

        {/* ═══ RISK ALERTS — warning posts ═══ */}
        {show('risks') && (
          <div className="space-y-5">
            {riskZones.length === 0 && (
              <Reveal><EmptyCard text="Walang risk alerts sa ngayon — magandang balita!" /></Reveal>
            )}
            {riskZones.map((z, i) => (
              <Reveal key={i} delay={i * 90}>
                <article className={`overflow-hidden rounded-2xl border shadow-sm transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-lg hover:shadow-[#0040E7]/5 ${
                  z.risk_level === 'high' || z.risk_level === 'critical' ? 'border-[#CE1126]/20' : 'border-gray-200/80'}`}>
                  {/* alert banner */}
                  <div className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide ${
                    z.risk_level === 'high' || z.risk_level === 'critical' ? 'bg-[#CE1126] text-white' : 'bg-accent text-[#1A1A2E]'}`}>
                    <AlertTriangle className="h-4 w-4" />
                    {z.risk_level === 'critical' ? 'Critical alert' : z.risk_level === 'high' ? 'High risk alert' : `${z.risk_level} risk`}
                  </div>

                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF2F2] text-[#CE1126]">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-textprimary">{z.province}</h2>
                        <p className="text-xs text-slate-400">{z.region}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-[1.75] text-slate-600">
                      Posibleng magkaroon ng brownout sa <strong className="text-textprimary">{z.province}</strong> within 48 hours.
                      <span className="mt-1 block text-xs text-textmuted">Dahilan: {z.predicted_cause}</span>
                    </p>

                    <p className="mt-3 rounded-xl bg-muted px-3.5 py-2.5 text-xs leading-relaxed text-textmuted">
                      <strong className="text-textprimary">Tip:</strong> Maghanda ng flashlight at i-charge ang mga devices.
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {/* ═══ ANNOUNCEMENTS — social feed posts ═══ */}
        {show('advisories') && (
          <div className="space-y-5">
            {announcements.length === 0 && (
              <Reveal><EmptyCard text="Walang announcements pa — balik-balikan lang!" /></Reveal>
            )}
            {announcements.map((a, i) => (
              <Reveal key={a.id} delay={i * 90}>
                <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:border-primary/20 hover:shadow-lg hover:shadow-[#0040E7]/5">
                  {/* post header */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF2F2] text-xs font-bold text-[#CE1126]">
                      {a.source}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-sm font-bold text-textprimary">{a.source}</h2>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        Official announcement · {a.published_at}
                      </p>
                    </div>
                    {a.severity !== 'info' && (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                        a.severity === 'critical' ? 'bg-[#CE1126] text-white' : 'bg-accent text-[#1A1A2E]'}`}>
                        <AlertTriangle className="h-3 w-3" /> {a.severity}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3.5 text-base font-bold leading-snug tracking-tight text-textprimary">{a.title}</h3>
                  <p className="mt-2 text-sm leading-[1.8] text-slate-600">{a.body}</p>

                  {/* post actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3.5">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                      <ThumbsUp className="h-3.5 w-3.5" /> {a.severity !== 'info' ? 'Nakakaapekto' : 'Impormasyon'}
                    </span>
                    <Link href="/map" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                      Tingnan ang apektadong lugar <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {/* Bottom helper */}
        <Reveal>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-5 text-center backdrop-blur">
            <p className="text-sm text-textmuted">
              Kailangan ng mas malalim na detalye?{' '}
              <Link href="/map" className="font-semibold text-primary hover:underline">Buksan ang live map</Link> — kita doon ang bawat report sa buong bansa.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

function MiniStat({ icon, value, label }) {
  return (
    <div className="px-2 py-3.5 text-center">
      <div className="flex items-center justify-center gap-1.5">
        {icon}
        <span className="text-xl font-bold tracking-tight text-textprimary">{value}</span>
      </div>
      <p className="mt-0.5 text-[11px] leading-tight text-slate-500">{label}</p>
    </div>
  )
}

function EmptyCard({ text }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200/80 bg-white px-6 py-10 text-center text-sm text-textmuted shadow-sm">
      <ShieldCheck className="h-5 w-5 text-primary" /> {text}
    </div>
  )
}
