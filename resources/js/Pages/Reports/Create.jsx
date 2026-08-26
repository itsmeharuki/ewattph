import { useState, useMemo } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Crosshair } from 'lucide-react'
import LocationPicker from '../../Components/LocationPicker'

export default function Create({ lgus, selectedLgu = null }) {
  const { url } = usePage()
  const queryLguId = useMemo(() => {
    const params = new URLSearchParams(url.split('?')[1] || '')
    return params.get('lgu_id') || ''
  }, [url])

  const [data, setData] = useState({
    lgu_id: queryLguId,
    latitude: '',
    longitude: '',
    outage_type: 'other',
    description: '',
    photo: null,
  })
  const [locating, setLocating] = useState(false)
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this device.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = nearestLgu(lgus, coords.latitude, coords.longitude)
        setData((d) => ({
          ...d,
          latitude: coords.latitude.toFixed(7),
          longitude: coords.longitude.toFixed(7),
          lgu_id: d.lgu_id || String(nearest?.id ?? ''),
        }))
        setLocating(false)
      },
      () => {
        alert('Could not get your location. Please pick your city/municipality below.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const submit = (e) => {
    e.preventDefault()
    setProcessing(true)
    router.post('/reports', toFormData(data), {
      onError: setErrors,
      onFinish: () => setProcessing(false),
      forceFormData: true,
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">Report Outage</h1>
      <p className="text-sm text-textmuted">Your report helps build a live map of the grid. AI will analyze severity instantly.</p>

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-brandborder bg-card p-4 shadow-sm">
        {/* Location */}
        <div>
          <label className="mb-1 block text-sm font-medium text-textmuted">Location</label>
          <button type="button" onClick={detectLocation}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-secondary text-sm font-semibold text-secondary hover:bg-secondary/5">
            <Crosshair className={`h-4 w-4 ${locating ? 'animate-spin' : ''}`} />
            {locating ? 'Detecting GPS…' : data.latitude ? `Pinned: ${data.latitude}, ${data.longitude}` : 'Use my current location'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input type="number" step="any" placeholder="Latitude" value={data.latitude} required
              onChange={(e) => setData({ ...data, latitude: e.target.value })}
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-sm" aria-label="Latitude" />
          </div>
          <div>
            <input type="number" step="any" placeholder="Longitude" value={data.longitude} required
              onChange={(e) => setData({ ...data, longitude: e.target.value })}
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-sm" aria-label="Longitude" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-textmuted">City / Municipality</label>
          <LocationPicker
            value={selectedLgu || lgus.find(l => String(l.id) === String(data.lgu_id)) || null}
            onChange={(lgu) => setData({ ...data, lgu_id: lgu ? String(lgu.id) : '' })}
            placeholder="Hanapin ang city / municipality…"
            compact
          />
          {errors.lgu_id && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.lgu_id}</p>}
        </div>

        {/* Outage type */}
        <div>
          <label htmlFor="type" className="mb-1 block text-sm font-medium text-textmuted">Outage type</label>
          <select id="type" value={data.outage_type}
            onChange={(e) => setData({ ...data, outage_type: e.target.value })}
            className="h-12 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm capitalize">
            {['transformer', 'distribution_line', 'transmission_line', 'brownout', 'rotational_blackout', 'other'].map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="desc" className="mb-1 block text-sm font-medium text-textmuted">Description (optional)</label>
          <textarea id="desc" rows={3} maxLength={2000} value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm" placeholder="What are you seeing?" />
          {errors.description && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.description}</p>}
        </div>

        {/* Photo */}
        <div>
          <label htmlFor="photo" className="mb-1 block text-sm font-medium text-textmuted">Photo (optional)</label>
          <input id="photo" type="file" accept="image/*"
            onChange={(e) => setData({ ...data, photo: e.target.files[0] })}
            className="block w-full text-sm text-textmuted file:h-10 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:text-sm file:font-semibold file:text-white" />
        </div>

        <button type="submit" disabled={processing}
          className="h-12 w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
          {processing ? 'Submitting & analyzing…' : 'Submit Report'}
        </button>
      </form>
    </div>
  )
}

function nearestLgu(lgus, lat, lng) {
  return [...lgus].sort((a, b) =>
    ((a.latitude - lat) ** 2 + (a.longitude - lng) ** 2) - ((b.latitude - lat) ** 2 + (b.longitude - lng) ** 2)
  )[0]
}

function toFormData(data) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== null && v !== '') fd.append(k, v)
  })
  return fd
}
