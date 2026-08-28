import { useState } from 'react'
import { router } from '@inertiajs/react'

export default function Create({ lgus, agencies }) {
  const [data, setData] = useState({ permit_type: 'solar_rooftop', description: '', lgu_id: '', agency_id: '' })
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => v !== '' && fd.append(k, v))
    files.forEach((f) => fd.append('documents[]', f))

    setProcessing(true)
    router.post('/permits', fd, {
      onError: setErrors,
      onFinish: () => setProcessing(false),
      forceFormData: true,
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-bold md:text-2xl">Permit Application</h1>
      <p className="text-xs text-textmuted md:text-sm">AI pre-screening checks completeness and compliance automatically.</p>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:rounded-2xl">
        <div>
          <label htmlFor="ptype" className="mb-1 block text-xs font-medium text-textmuted sm:text-sm">Permit type</label>
          <select id="ptype" value={data.permit_type}
            onChange={(e) => setData({ ...data, permit_type: e.target.value })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm capitalize sm:h-12">
            {['solar_rooftop', 'transmission_line', 'generator_set', 'battery_storage', 'wind_turbine', 'other'].map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="plgu" className="mb-1 block text-xs font-medium text-textmuted sm:text-sm">City / Municipality (for local permits)</label>
          <select id="plgu" value={data.lgu_id} onChange={(e) => setData({ ...data, lgu_id: e.target.value, agency_id: '' })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm sm:h-12">
            <option value="">—</option>
            {lgus.map((l) => <option key={l.id} value={l.id}>{l.name}, {l.province}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="pagency" className="mb-1 block text-xs font-medium text-textmuted sm:text-sm">National agency (for national permits)</label>
          <select id="pagency" value={data.agency_id} onChange={(e) => setData({ ...data, agency_id: e.target.value, lgu_id: '' })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm sm:h-12">
            <option value="">—</option>
            {agencies.map((a) => <option key={a.id} value={a.id}>{a.abbreviation} — {a.name}</option>)}
          </select>
          {errors.lgu_id && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.lgu_id}</p>}
        </div>

        <div>
          <label htmlFor="pdesc" className="mb-1 block text-xs font-medium text-textmuted sm:text-sm">Project description</label>
          <textarea id="pdesc" rows={4} required maxLength={3000} value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm"
            placeholder="Describe your project (capacity, location details, timeline...)" />
          {errors.description && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="docs" className="mb-1 block text-xs font-medium text-textmuted sm:text-sm">Documents (PDF/images, max 10MB each)</label>
          <input id="docs" type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFiles([...e.target.files])}
            className="block w-full text-xs text-textmuted file:h-9 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:text-sm file:font-semibold file:text-white sm:text-sm" />
          {errors['documents.0'] && <p role="alert" className="mt-1 text-xs font-medium text-danger">{errors['documents.0']}</p>}
        </div>

        <button type="submit" disabled={processing || !data.lgu_id && !data.agency_id}
          className="h-11 w-full rounded-lg bg-primary font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:h-12">
          {processing ? 'Submitting & pre-screening...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
