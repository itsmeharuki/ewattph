import Logo from './Logo'

/** Exact e.gov.ph-style dark footer (#111111, seal + white logo, 3 columns). */
export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white mb-14 md:mb-0">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <Logo dark />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            The official energy intelligence platform of the Philippine government — real-time outage mapping, permits, and predictive analytics.
          </p>
          <p className="mt-3 text-xs text-slate-500">Department of Energy · DICT · NextGenPH 2026</p>
        </div>

        {/* About Us */}
        <nav aria-label="About us links">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">About Us</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {['About eWattPH', 'Terms & Conditions', 'Privacy Policy', 'FAQs'].map((label) => (
              <li key={label}><a href="#" className="text-slate-300 transition hover:text-accent">{label}</a></li>
            ))}
          </ul>
        </nav>

        {/* Follow Us */}
        <nav aria-label="Follow us links">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Follow Us</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href="https://www.facebook.com/eGovPhilippines" target="_blank" rel="noopener" className="text-slate-300 transition hover:text-accent">Facebook</a></li>
            <li><a href="mailto:support@e.gov.ph" className="text-slate-300 transition hover:text-accent">support@e.gov.ph</a></li>
            <li><a href="https://www.instagram.com/egovph" target="_blank" rel="noopener" className="text-slate-300 transition hover:text-accent">Instagram</a></li>
          </ul>
        </nav>

        {/* Government */}
        <nav aria-label="Government links">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Government</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><a href="https://www.officialgazette.gov.ph" target="_blank" rel="noopener" className="text-slate-300 transition hover:text-accent">Official Gazette</a></li>
            <li><a href="https://www.doe.gov.ph" target="_blank" rel="noopener" className="text-slate-300 transition hover:text-accent">Department of Energy</a></li>
            <li><a href="https://e.gov.ph" target="_blank" rel="noopener" className="text-slate-300 transition hover:text-accent">eGovPH Super App</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Republic of the Philippines — All rights reserved.</span>
          <span>Empowering Governance with Intelligent Energy</span>
        </div>
      </div>
    </footer>
  )
}
