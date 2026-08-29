import { useState, useEffect } from 'react'

/**
 * Minimal splash — eWattPH mark + "eWattPH" text on frosted blur.
 * Shows on every page refresh. Holds 2s, then fades out smoothly.
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [exit, setExit] = useState(false)

  useEffect(() => {
    const exitTimer = setTimeout(() => setExit(true), 4000)
    const hideTimer = setTimeout(() => setVisible(false), 4800)
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-700 ease-out ${
        exit ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* eWattPH circular mark */}
        <img
          src="/images/ewattph-mark.svg"
          alt="eWattPH"
          className={`h-28 w-28 object-contain transition-all duration-700 ease-out md:h-36 md:w-36 ${
            exit ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          style={{
            animation: !exit ? 'splashPop 1s cubic-bezier(0.22, 1, 0.36, 1) 200ms both' : 'none',
          }}
        />

        {/* eWattPH text */}
        <h1
          className={`text-4xl font-bold tracking-tight text-primary transition-all duration-700 ease-out md:text-5xl ${
            exit ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
          }`}
          style={{
            animation: !exit ? 'splashSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 500ms both' : 'none',
          }}
        >
          eWattPH
        </h1>
      </div>

      <style>{`
        @keyframes splashPop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes splashSlideUp {
          0% { transform: translateY(16px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
