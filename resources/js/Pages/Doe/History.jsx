import { useState } from 'react'
import { router } from '@inertiajs/react'
import { FileText, MapPin, Filter, ChevronDown, ChevronUp, ExternalLink, Clock, BarChart3 } from 'lucide-react'

export default function DoeHistory({ incidents, hotspots, regions, provinces, cities, filters }) {
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
    router.get('/doe/history', { ...localFilters, hotspot_page: 1 }, { preserveState: true, replace: true })
  }

  const clearFilters = () => {
    const empty = { region: '', province: '', city: '', status: '', from: '', to: '' }
    setLocalFilters(empty)
    router.get('/doe/history', {}, { preserveState: true, replace: true })
  }

  const hasActiveFilters = Object.values(localFilters).some(v => v)

  const gotoHotspotPage = (page) => {
    router.get('/doe/history', { ...filters, hotspot_page: page }, { preserveState: true, replace: true })
  }

  const statusDot = (s) => {
    if (s === 'resolved') return 'bg-emerald-400'
    if (s === 'verified') return 'bg-red-400'
    if (s === 'auto-detected') return 'bg-blue-400'
    return 'bg-amber-400'
  }

  const statusLabel = (s) => {
    if (s === 'auto-detected') return { text: 'Auto-detected', cls: 'bg-blue-50 text-blue-600' }
    if (s === 'resolved') return { text: 'Resolved', cls: 'bg-emerald-50 text-emerald-600' }
    if (s === 'verified') return { text: 'Verified', cls: 'bg-red-50 text-red-600' }
    return { text: 'Pending', cls: 'bg-amber-50 text-amber-600' }
  }

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-textprimary md:text-xl">Outage History</h1>
        <p className="mt-0.5 text-xs text-textmuted md:text-sm">Lahat ng brownout reports at auto-detected incidents</p>
      </div>

      {/* ── Summary stat ── */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-2.5 sm:px-5 sm:py-3">
          <div className="text-[10px] font-medium uppercase tracking-wide text-textmuted sm:text-xs">Total Incidents</div>
          <div className="text-lg font-bold tabular-nums text-textprimary sm:text-xl">{incidents.total}</div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="rounded-xl border border-gray-100 bg-white">
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex w-full items-center justify-between px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-textmuted" />
            <span className="text-xs font-medium text-textprimary sm:text-sm">Filter by location</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Active</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-textmuted transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SelectFilter label="Region" value={localFilters.region}
                onChange={(v) => setLocalFilters({ ...localFilters, region: v, province: '', city: '' })}
                options={regions} placeholder="Buong Pilipinas" />
              <SelectFilter label="Probinsya" value={localFilters.province}
                onChange={(v) => setLocalFilters({ ...localFilters, province: v, city: '' })}
                options={provinces} placeholder="Lahat ng probinsya" />
              <SelectFilter label="Lungsod / Bayan" value={localFilters.city}
                onChange={(v) => setLocalFilters({ ...localFilters, city: v })}
                options={cities} placeholder="Lahat ng lungsod" />
              <SelectFilter label="Status" value={localFilters.status}
                onChange={(v) => setLocalFilters({ ...localFilters, status: v })}
                options={['pending', 'verified', 'resolved']} placeholder="Lahat" />
              <div>
                <label className="mb-1 block text-[10px] font-medium text-textmuted sm:text-xs">Mula</label>
                <input type="date" value={localFilters.from}
                  onChange={(e) => setLocalFilters({ ...localFilters, from: e.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-xs text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-medium text-textmuted sm:text-xs">Hanggang</label>
                <input type="date" value={localFilters.to}
                  onChange={(e) => setLocalFilters({ ...localFilters, to: e.target.value })}
                  className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-xs text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={applyFilters}
                className="rounded-lg bg-primary px-5 py-2 text-xs font-medium text-white transition hover:bg-primary/90 sm:text-sm">
                Mag-apply
              </button>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-textmuted transition hover:bg-gray-50 sm:text-sm">
                  Burahin
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Main content ── */}
      <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
        {/* ── Incident list (wider) ── */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-100 bg-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-textmuted" />
                <span className="text-xs font-medium text-textprimary sm:text-sm">Incidents</span>
              </div>
              <span className="text-[10px] text-textmuted sm:text-xs">{incidents.total} total</span>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-50">
              {incidents.data.length === 0 ? (
                <div className="px-4 py-16 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-200" />
                  <p className="mt-2 text-sm text-textmuted">Walang incidents</p>
                </div>
              ) : (
                incidents.data.map((item) => {
                  const badge = statusLabel(item.status)
                  return (
                    <div key={`${item.type}-${item.id}`} className="px-4 py-3 transition-colors hover:bg-gray-50/50 sm:px-5 sm:py-3.5">
                      {/* Top line: location + status badge */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot(item.status)}`} />
                          <span className="text-xs font-semibold text-textprimary sm:text-sm truncate">{item.location}</span>
                          {item.province && item.province !== item.location && (
                            <span className="hidden text-[10px] text-textmuted sm:inline sm:text-xs">{item.province}</span>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${badge.cls}`}>
                          {badge.text}
                        </span>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="mt-1 pl-3.5 text-[11px] leading-relaxed text-textmuted line-clamp-2 sm:text-xs">
                          {item.description}
                        </p>
                      )}

                      {/* Meta row */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 pl-3.5 text-[10px] text-textmuted sm:text-xs">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 opacity-50" />
                          {item.formatted_date}
                        </span>
                        {item.type === 'reported' && item.severity > 0 && (
                          <span>Severity {item.severity}</span>
                        )}
                        {item.duration && <span>Duration: {item.duration}</span>}
                        {item.type === 'auto' && item.confidence && (
                          <span>{item.confidence}% confidence</span>
                        )}
                        {item.type === 'auto' && item.source && (
                          <span className="capitalize">{item.source}</span>
                        )}
                        {item.source_url && (
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-primary transition hover:text-primary/80">
                            Source <ExternalLink className="h-2.5 w-2.5" />
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
              <div className="border-t border-gray-100 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-textmuted sm:text-xs">
                    Page {incidents.current_page} of {incidents.last_page}
                  </span>
                  <nav className="flex gap-1">
                    {incidents.links.filter(l => l.url).map((l, i) => (
                      <a key={i} href={l.url}
                        className={`min-w-[28px] rounded-lg px-2 py-1 text-center text-xs transition sm:min-w-[32px] sm:text-sm ${
                          l.active ? 'bg-primary font-medium text-white' : 'text-textmuted hover:bg-gray-100'
                        }`}
                        dangerouslySetInnerHTML={{ __html: l.label }} />
                    ))}
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Most Affected Areas (narrower, paginated) ── */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-danger" />
                <span className="text-xs font-semibold text-textprimary sm:text-sm">Most Affected Areas</span>
              </div>
              <p className="mt-0.5 text-[10px] text-textmuted sm:text-xs">Mga lugar na pinakamaraming brownout</p>
            </div>

            <div className="divide-y divide-gray-50">
              {hotspots.data.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-xs text-textmuted">Walang data</p>
                </div>
              ) : (
                hotspots.data.map((h, i) => {
                  const activeRate = h.total > 0 ? Math.round((h.active / h.total) * 100) : 0
                  const rank = (hotspots.current_page - 1) * 10 + i + 1
                  const barColor = activeRate >= 60 ? 'bg-red-400' : activeRate >= 30 ? 'bg-amber-400' : 'bg-emerald-400'

                  return (
                    <div key={i} className="px-4 py-3 transition-colors hover:bg-gray-50/50 sm:px-4">
                      <div className="flex items-start gap-2.5">
                        {/* Rank badge */}
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          rank <= 3 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-textmuted'
                        }`}>
                          {rank}
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-textprimary sm:text-sm">{h.location}</div>
                          {h.province && <div className="text-[10px] text-textmuted sm:text-xs">{h.province}</div>}

                          {/* Status text */}
                          <div className="mt-1 text-[10px] sm:text-xs">
                            {h.active > 0 ? (
                              <span className="text-red-500">
                                {h.active} brownout {h.active === 1 ? 'ang' : 'ang'} hindi pa naresolba
                              </span>
                            ) : (
                              <span className="text-emerald-500">Na-resolba na lahat</span>
                            )}
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2">
                            <div className="flex h-1 w-full overflow-hidden rounded-full bg-gray-100">
                              <div className={`rounded-full ${barColor}`} style={{ width: `${Math.max(activeRate, 2)}%` }} />
                            </div>
                            <div className="mt-0.5 flex justify-between text-[9px] text-textmuted">
                              <span>{h.resolved} resolved</span>
                              <span>{h.total} total</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Hotspot pagination */}
            {hotspots.last_page > 1 && (
              <div className="border-t border-gray-100 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-textmuted">
                    {hotspots.current_page}/{hotspots.last_page}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => gotoHotspotPage(hotspots.current_page - 1)}
                      disabled={hotspots.current_page <= 1}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-[10px] font-medium text-textmuted transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed sm:text-xs">
                      Prev
                    </button>
                    <button onClick={() => gotoHotspotPage(hotspots.current_page + 1)}
                      disabled={hotspots.current_page >= hotspots.last_page}
                      className="rounded-lg border border-gray-200 px-2.5 py-1 text-[10px] font-medium text-textmuted transition hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed sm:text-xs">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SelectFilter({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-medium text-textmuted sm:text-xs">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3 text-xs text-textprimary focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 sm:text-sm">
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
