import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether an element has scrolled into view, for the scroll-reveal
 * effect. Mirrors the original site's IntersectionObserver: fires once
 * (threshold 0.15) then unobserves. Respects prefers-reduced-motion by
 * revealing immediately, since the original design didn't animate at all
 * for users who opt out of motion.
 */
export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, ...options },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, inView }
}
