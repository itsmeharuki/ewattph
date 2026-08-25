import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

const key = import.meta.env.VITE_PUSHER_APP_KEY

if (key) {
  window.Echo = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
  })
}

// Live map updates — degrade gracefully when broadcasting is disabled.
export function subscribeOutages(handler) {
  if (!window.Echo) return () => {}
  const channel = window.Echo.channel('outages').listen('.report.updated', handler)
  return () => channel.stopListening('.report.updated')
}
