import { useState, useEffect, useRef } from 'react'
import { MapPin, Building2, Search, X, Check } from 'lucide-react'

/**
 * Reusable location picker with debounced autocomplete search.
 * Fetches from /api/public/places?q=... backed by PSGC-imported LGU data.
 *
 * Props:
 *  - value: currently selected LGU object { id, name, province, region } | null
 *  - onChange: (lgu | null) => void
 *  - placeholder?: string
 *  - compact?: boolean  — smaller trigger button style
 *  - scopeLabel?: string — override the trigger text
 */
export default function LocationPicker({
  value,
  onChange,
  placeholder = 'Hanapin ang city / municipality…',
  compact = false,
  scopeLabel,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)
  const abortRef = useRef(null)

  // Close on outside click
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

  // Debounced search — query is the only dependency
  useEffect(() => {
    clearTimeout(debounceRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(
          `/api/public/places?q=${encodeURIComponent(query)}&limit=20`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!controller.signal.aborted) {
          setResults(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[LocationPicker] search error:', err)
        }
      }
      if (!controller.signal.aborted) {
        setLoading(false)
      }
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
    setResults([])
  }

  const clear = (e) => {
    e.stopPropagation()
    onChange(null)
    setQuery('')
    setResults([])
  }

  const label = scopeLabel || (value ? `${value.name}, ${value.province}` : 'Buong Pilipinas')

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(!open); setQuery('') }}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={compact
          ? 'inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-textprimary shadow-sm transition hover:border-primary/40'
          : 'inline-flex h-12 items-center gap-2.5 rounded-full border border-brandborder bg-white px-5 text-sm font-semibold text-textprimary shadow-sm transition duration-300 hover:border-primary/40'
        }
      >
        <Building2 className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[200px]">{label}</span>
        {value && (
          <span onClick={clear} className="ml-1 rounded-full p-0.5 text-slate-400 hover:bg-muted hover:text-textprimary">
            <X className="h-3.5 w-3.5" />
          </span>
        )}
        <ChevronIcon className={`h-4 w-4 text-slate-400 transition duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div role="listbox" aria-label="Piliin ang lokasyon"
          className="absolute left-1/2 z-50 mt-2 w-80 -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xl">
          <p className="border-b border-gray-100 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Piliin ang lokasyon
          </p>

          {/* Search input */}
          <div className="border-b border-gray-100 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                aria-label="Search location"
                autoFocus
                className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto py-1">
            {/* "Buong Pilipinas" option */}
            {!query && (
              <button onClick={() => select(null)} role="option" aria-selected={!value}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-textprimary transition hover:bg-muted">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Buong Pilipinas
                </span>
                {!value && <Check className="h-4 w-4 text-primary" />}
              </button>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Naghahanap…
              </div>
            )}

            {!loading && results.map((l) => (
              <button key={l.id} onClick={() => select(l)} role="option" aria-selected={value?.id === l.id}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-textprimary transition hover:bg-muted">
                <span className="flex min-w-0 flex-col items-start">
                  <span className="truncate font-medium">{l.name}</span>
                  <span className="truncate text-xs text-slate-400">{l.province} · {l.region}</span>
                </span>
                {value?.id === l.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))}

            {!loading && query.length >= 2 && results.length === 0 && (
              <p className="px-4 py-3 text-sm text-textmuted">Walang nahanap na lugar.</p>
            )}

            {!loading && !query && results.length === 0 && (
              <p className="px-4 py-3 text-xs text-slate-400">Simulan ang pag-type para maghanap ng city o municipality.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
