import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import '../css/app.css'
import MainLayout from './Layouts/MainLayout'

const appName = 'eWattPH'

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true })
    const page = pages[`./Pages/${name}.jsx`]
    page.default.layout = page.default.layout || ((page) => <MainLayout>{page}</MainLayout>)
    return page
  },
  setup({ App, el, props }) {
    createRoot(el).render(<App {...props} />)
  },
  progress: {
    color: '#1E3A8A',
    showSpinner: false,
  },
})
