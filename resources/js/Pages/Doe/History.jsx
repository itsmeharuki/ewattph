import { useState } from 'react'
import { router } from '@inertiajs/react'
import { FileText, MapPin, Filter, ChevronDown, ExternalLink, Clock, BarChart3, Shield } from 'lucide-react'

export default function DoeHistory({ incidents, hotspots, regions, provinces, cities, filters, isPublic }) {
  const basePath = isPublic ? '/history' : '/doe/history'
  const [showFilters, setShowFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    region: filters.region || '',
    province: filters.province || '',
    city: filters.city || '',
    status: filters.status || '',
    from: filters.from || '',
    to: filters.to || '',
  })

  const applyFilters = () => {
    router.get(basePath, { ...localFilters, hotspot_page: 1 }, { preserveState: true, replace: true })
  }

  const clearFilters = () => {
    const empty = { region: '', province: '', city: '', status: '', from: '', to: '' }
    setLocalFilters(empty)
    router.get(basePath, {}, { preserveState: true, replace: true })
  }

  const hasActiveFilters = Object.values(localFilters).some(v => v)

  const gotoHotspotPage = (page) => {
    router.get(basePath, { ...filters, hotspot_page: page }, { preserveState: true, replace: true })
  }

  const statusDot = (s) => {
    if (s === 'resolved') return 'bg-emerald-400'
    if (s === 'verified') return 'bg-red-400'
    if (s === 'auto-detected') return 'bg-blue-400'
    return 'bg-amber-400'
  }

  const statusLabel = (s) => {
    if (s === 'auto-detected') return { text: 'Auto', cls: 'bg-blue-50 text-blue-600' }
    if (s === 'resolved') return { text: 'Resolved', cls: 'bg-emerald-50 text-emerald-600' }
    if (s === 'verified') return { text: 'Verified', cls: 'bg-red-50 text-red-600' }
    return { text: 'Pending', cls: 'bg-amber-50 text-amber-600' }
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5">
      {/* Header */}
      <div className="px-0.5">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-textprimary sm:text-lg md:text-xl">Outage History</h1>
          {!isPublic && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary sm:px-2 sm:text-[10px]">
              <Shield className="h-2 w-2 sm:h-2.5 sm:w-2.5" /> DOE
            </span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-textmuted sm:text-xs md:text-sm">
          {isPublic
            ? 'Lahat ng brownout reports sa buong Pilipinas'
            : 'Lahat ng brownout reports at auto-detected incidents'}
        </p>
      </div>

      {/* ── Summary stat ── */}
      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3">
        <div className="text-[9px] font-medium uppercase tracking-wide text-textmuted sm:text-[10px] md:text-xs">Total Incidents</div>
        <div className="text-base font-bold tabular-nums text-textprimary sm:text-lg md:text-xl">{incidents.total}</div>
      </div>

      {/* ── Filters (DOE only) ── */}
      {!isPublic && (
        <div className="rounded-xl border border-gray-100 bg-white">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex w-full items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 md:px-5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Filter className="h-3 w-3 text-textmuted sm:h-3.5 sm:w-3.5" />
              <span className="text-[11px] font-medium text-textprimary sm:text-xs md:text-sm">Filter</span>
              {hasActiveFilters && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary sm:px-2 sm:text-[10px]">Active</span>
              )}
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-textmuted transition-transform duration-200 sm:h-4 sm:w-4 ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="border-t border-gray-100 px-3 py-3 sm:px-4 sm:py-4 md:px-5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
                <SelectFilter label="Region" value={localFilters.region}
                  onChange={(v) => setLocalFilters({ ...localFilters, region: v, province: '', city: '' })}
                  options={regions} placeholder="Buong Pilipinas" />
                <SelectFilter label="Probinsya" value={localFilters.province}
                  onChange={(v) => setLocalFilters({ ...localFilters, province: v, city: '' })}
                  options={provinces} placeholder="Lahat" />
                <SelectFilter label="Lungsod / Bayan" value={localFilters.city}
                  onChange={(v) => setLocalFilters({ ...localFilters, city: v })}
                  options={cities} placeholder="Lahat" />
                <SelectFilter label="Status" value={localFilters.status}
                  onChange={(v) => setLocalFilters({ ...localFilters, status: v })}
                  options={['pending', 'verified', 'resolved']} placeholder="Lahat" />
                <div>
                  <label className="mb-0.5 block text-[9px] font-medium text-textmuted sm:mb-1 sm:text-[10px] md:text-xs">Mula</label>
                  <input type="date" value={localFilters.from}
                    onChange={(e) => setLocalFilters({ ...localFilters, from: e.target.value })}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 text-[11px] text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:h-10 sm:px-3 sm:text-xs md:text-sm" />
                </div>
                <div>
                  <label className="mb-0.5 block text-[9px] font-medium text-textmuted sm:mb-1 sm:text-[10px] md:text-xs">Hanggang</label>
                  <input type="date" value={localFilters.to}
                    onChange={(e) => setLocalFilters({ ...localFilters, to: e.target.value })}
                    className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 text-[11px] text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:h-10 sm:px-3 sm:text-xs md:text-sm" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 sm:mt-4">
                <button onClick={applyFilters}
                  className="rounded-lg bg-primary px-4 py-1.5 text-[11px] font-medium text-white transition hover:bg-primary/90 sm:px-5 sm:py-2 sm:text-xs md:text-sm">
                  Mag-apply
                </button>
                {hasActiveFilters && (
                  <button onClick={clearFilters}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-textmuted transition hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-xs md:text-sm">
                    Burahin
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Public: simple province filter ── */}
      {isPublic && (
        <div className="rounded-xl border border-gray-100 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3 w-3 shrink-0 text-textmuted sm:h-3.5 sm:w-3.5" />
            <select value={localFilters.province}
              onChange={(e) => {
                const v = e.target.value
                setLocalFilters({ ...localFilters, province: v })
                router.get(basePath, { province: v, hotspot_page: 1 }, { preserveState: true, replace: true })
              }}
              className="h-8 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 text-[11px] text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:h-9 sm:px-3 sm:text-xs md:text-sm">
              <option value="">Buong Pilipinas</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* ── Incident list ── */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BarChart3 className="h-3 w-3 text-textmuted sm:h-3.5 sm:w-3.5" />
            <span className="text-[11px] font-medium text-textprimary sm:text-xs md:text-sm">Incidents</span>
          </div>
          <span className="text-[9px] text-textmuted sm:text-[10px] md:text-xs">{incidents.total} total</span>
        </div>

        <div className="divide-y divide-gray-50">
          {incidents.data.length === 0 ? (
            <div className="px-3 py-12 sm:px-4 md:px-5">
              <FileText className="mx-auto h-7 w-7 text-gray-200 sm:h-8 sm:w-8" />
              <p className="mt-2 text-center text-[11px] text-textmuted sm:text-sm">Walang incidents</p>
            </div>
          ) : (
            incidents.data.map((item) => {
              const badge = statusLabel(item.status)
              return (
                <div key={`${item.type}-${item.id}`} className="px-3 py-2.5 transition-colors hover:bg-gray-50/50 sm:px-4 sm:py-3 md:px-5 md:py-3.5">
                  {/* Location + badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 sm:gap-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot(item.status)}`} />
                      <span className="text-[11px] font-semibold text-textprimary truncate sm:text-xs md:text-sm">{item.location}</span>
                      {item.province && item.province !== item.location && (
                        <span className="hidden text-[9px] text-textmuted sm:inline sm:text-[10px] md:text-xs">{item.province}</span>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:px-2 sm:text-[10px] md:text-xs ${badge.cls}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-0.5 pl-3 text-[10px] leading-relaxed text-textmuted line-clamp-2 sm:pl-3.5 sm:text-[11px] md:text-xs">
                      {item.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-3 text-[9px] text-textmuted sm:mt-1.5 sm:pl-3.5 sm:gap-x-3 sm:text-[10px] md:text-xs">
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5 opacity-50 sm:h-3 sm:w-3" />
                      {item.formatted_date}
                    </span>
                    {item.type === 'reported' && item.severity > 0 && (
                      <span>Sev. {item.severity}</span>
                    )}
                    {item.duration && <span>{item.duration}</span>}
                    {item.type === 'auto' && item.confidence && (
                      <span>{item.confidence}%</span>
                    )}
                    {item.source_url && (
                      <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary transition hover:text-primary/80">
                        Source <ExternalLink className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {incidents.last_page > 1 && (
          <div className="border-t border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-textmuted sm:text-[10px] md:text-xs">
                {incidents.current_page}/{incidents.last_page}
              </span>
              <nav className="flex gap-0.5 sm:gap-1">
                {incidents.links.filter(l => l.url).map((l, i) => (
                  <a key={i} href={l.url}
                    className={`min-w-[24px] rounded-md px-1.5 py-0.5 text-center text-[10px] transition sm:min-w-[28px] sm:rounded-lg sm:px-2 sm:py-1 sm:text-xs ${
                      l.active ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
                    }`}
                    dangerouslySetInnerHTML={{ __html: l.label }} />
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* ── Most Affected Areas (DOE only) ── */}
      {!isPublic && hotspots.data.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin className="h-3 w-3 text-danger sm:h-3.5 sm:w-3.5" />
              <span className="text-[11px] font-semibold text-textprimary sm:text-xs md:text-sm">Most Affected Areas</span>
            </div>
            <p className="mt-0.5 text-[9px] text-textmuted sm:text-[10px] md:text-xs">Mga lugar na pinakamaraming brownout</p>
          </div>

          <div className="divide-y divide-gray-50">
            {hotspots.data.map((h, i) => {
              const activeRate = h.total > 0 ? Math.round((h.active / h.total) * 100) : 0
              const rank = (hotspots.current_page - 1) * 10 + i + 1
              const barColor = activeRate >= 60 ? 'bg-red-400' : activeRate >= 30 ? 'bg-amber-400' : 'bg-emerald-400'

              return (
                <div key={i} className="px-3 py-2.5 transition-colors hover:bg-gray-50/50 sm:px-4 sm:py-3 md:px-5">
                  <div className="flex items-start gap-2">
                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold sm:h-5 sm:w-5 sm:text-[10px] ${
                      rank <= 3 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-textmuted'
                    }`}>
                      {rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold text-textprimary sm:text-xs md:text-sm">{h.location}</div>
                      {h.province && <div className="text-[9px] text-textmuted sm:text-[10px] md:text-xs">{h.province}</div>}
                      <div className="mt-0.5 text-[9px] sm:text-[10px] md:text-xs">
                        {h.active > 0 ? (
                          <span className="text-red-500">{h.active} brownout hindi pa naresolba</span>
                        ) : (
                          <span className="text-emerald-500">Na-resolba na lahat</span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-100">
                          <div className={`rounded-full ${barColor}`} style={{ width: `${Math.max(activeRate, 2)}%` }} />
                        </div>
                        <div className="mt-0.5 flex justify-between text-[8px] text-textmuted sm:text-[9px]">
                          <span>{h.resolved} resolved</span>
                          <span>{h.total} total</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {hotspots.last_page > 1 && (
            <div className="border-t border-gray-100 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-textmuted sm:text-[10px]">
                  {hotspots.current_page}/{hotspots.last_page}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => gotoHotspotPage(hotspots.current_page - 1)}
                    disabled={hotspots.current_page <= 1}
                    className="rounded-md border border-gray-200 px-2 py-0.5 text-[9px] font-medium text-textmuted transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-[10px]">
                    Prev
                  </button>
                  <button onClick={() => gotoHotspotPage(hotspots.current_page + 1)}
                    disabled={hotspots.current_page >= hotspots.last_page}
                    className="rounded-md border border-gray-200 px-2 py-0.5 text-[9px] font-medium text-textmuted transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-[10px]">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SelectFilter({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="mb-0.5 block text-[9px] font-medium text-textmuted sm:mb-1 sm:text-[10px] md:text-xs">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 text-[11px] text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:h-10 sm:px-3 sm:text-xs md:text-sm">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
