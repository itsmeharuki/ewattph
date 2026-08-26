import { useEffect, useRef, useState } from 'react'

/**
 * Seamless scroll-reveal wrapper — fades/slides content in the first time
 * it enters the viewport. Respects prefers-reduced-motion via CSS.
 */
export default function Reveal({ children, delay = 0, className = '', y = 28 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, '--reveal-y': `${y}px` }}
    >
      {children}
    </div>
  )
}
