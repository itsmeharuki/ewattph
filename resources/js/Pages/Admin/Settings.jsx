import { useState } from 'react'
import { Settings as SettingsIcon, Key, Cpu, Globe } from 'lucide-react'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    ai_model: 'openrouter/o1-mini',
    ai_max_tokens: '4096',
    openrouter_api_key: '',
    resend_api_key: '',
    app_url: window.location.origin,
  })

  const update = (key, val) => setSettings({ ...settings, [key]: val })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textprimary">System Settings</h1>
        <p className="mt-1 text-sm text-textmuted">Configure AI models, API keys, and environment variables.</p>
      </div>

      {/* AI Configuration */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-textmuted">AI Configuration</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-textmuted">AI Model</label>
            <select value={settings.ai_model} onChange={(e) => update('ai_model', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="openrouter/o1-mini">OpenRouter o1-mini</option>
              <option value="openrouter/o1-pro">OpenRouter o1-pro</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-textmuted">Max Tokens</label>
            <input type="number" value={settings.ai_max_tokens} onChange={(e) => update('ai_max_tokens', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Key className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-textmuted">API Keys</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-textmuted">OpenRouter API Key</label>
            <input type="password" placeholder="sk-or-..." value={settings.openrouter_api_key}
              onChange={(e) => update('openrouter_api_key', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-textmuted">Resend API Key (Email)</label>
            <input type="password" placeholder="re_..." value={settings.resend_api_key}
              onChange={(e) => update('resend_api_key', e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      </div>

      {/* Environment */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-textmuted">Environment</h2>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-textmuted">Application URL</label>
          <input type="url" value={settings.app_url} onChange={(e) => update('app_url', e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
      </div>

      <div className="flex justify-end">
        <button className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90">
          Save Settings
        </button>
      </div>
    </div>
  )
}
