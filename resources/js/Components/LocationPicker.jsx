import { useState, useEffect, useRef } from 'react'
import { Building2, Search, X, Check, MapPin } from 'lucide-react'

/**
 * Location picker — compact eGovPH style.
 * Fetches from /api/public/places?q=... backed by PSGC-imported LGU data.
 */
export default function LocationPicker({
  value,
  onChange,
  placeholder = 'Search city or municipality…',
  compact = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)
  const abortRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(`/api/public/places?q=${encodeURIComponent(query)}&limit=15`, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!controller.signal.aborted) setResults(Array.isArray(data) ? data : [])
      } catch (err) {
        if (err.name !== 'AbortError') console.error('[LocationPicker]', err)
      }
      if (!controller.signal.aborted) setLoading(false)
    }, 280)

    return () => {
      clearTimeout(debounceRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [query])

  const select = (lgu) => {
    onChange(lgu)
    setOpen(false)
    setQuery('')
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange(null)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery('') }}
        className={compact
          ? 'inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-textprimary shadow-sm transition hover:border-primary/40'
          : 'inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-textprimary shadow-sm transition hover:border-primary/40'
        }
      >
        <Building2 className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[160px]">
          {value ? value.name : 'All locations'}
        </span>
        {value && (
          <span onClick={clear} className="ml-0.5 rounded p-0.5 text-slate-400 hover:bg-gray-100 hover:text-textprimary">
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* Search */}
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {/* All Philippines option */}
            {!query && (
              <button onClick={() => select(null)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-textprimary transition hover:bg-gray-50">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Buong Pilipinas</span>
                {!value && <Check className="ml-auto h-4 w-4 text-primary" />}
              </button>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-slate-400">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Searching…
              </div>
            )}

            {!loading && results.map((l) => (
              <button key={l.id} onClick={() => select(l)}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-textprimary truncate">{l.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{l.province} · {l.region}</p>
                </div>
                {value?.id === l.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))}

            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-slate-400">Walang nahanap</p>
            )}

            {!loading && !query && results.length === 0 && (
              <p className="px-3 py-3 text-center text-[11px] text-slate-400">Type to search</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
