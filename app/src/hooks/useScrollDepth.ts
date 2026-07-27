import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Writes `--depth` onto the element: 0 while its top sits at the viewport
 * top, ramping to 1 once it has scrolled one full element-height upward.
 * Used to push Z-layered content toward the viewer as the page scrolls, so
 * scrolling reads as travelling *through* the scene rather than past it.
 */
export function useScrollDepth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    let frame = 0

    function update() {
      frame = 0
      const rect = el!.getBoundingClientRect()
      const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1)
      el!.style.setProperty('--depth', progress.toFixed(4))
    }

    // Coalesce a burst of scroll events into one write per frame.
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
      el.style.removeProperty('--depth')
    }
  }, [prefersReduced])

  return ref
}
