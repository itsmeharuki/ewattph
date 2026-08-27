export default function Logo({ dark = false, size = 'h-9', showText = true }) {
  return (
    <span className="flex items-center gap-2.5">
      <img src="/images/ewattph-mark.svg" alt="" className={`${size} w-auto`} aria-hidden="true" />
      {showText && (
        <span className={`text-xl font-bold tracking-tight ${dark ? 'text-white' : 'text-primary'}`}>
          eWattPH
        </span>
      )}
    </span>
  )
}
