import { useEffect, useRef, useState } from 'react'

/**
 * How far an element's on-screen box sits below its real layout position.
 * The 3D reveal's starting transform pivots on the bottom edge and recedes,
 * which pushes a tall element's box hundreds of pixels down — enough that
 * the observer saw a long list near the bottom of the first screen as
 * off-screen and never revealed it until the visitor scrolled. offsetTop
 * ignores transforms and the bounding rect includes them, so the difference
 * is exactly that shift.
 */
function transformShift(el: HTMLElement): number {
  let layoutTop = 0
  for (let node: HTMLElement | null = el; node; node = node.offsetParent as HTMLElement | null) {
    layoutTop += node.offsetTop
  }
  return Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - layoutTop))
}

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
      // Extending the viewport's bottom edge by the transform shift makes
      // the element reveal when its real position scrolls into view.
      { threshold: 0.15, rootMargin: `0px 0px ${transformShift(el)}px 0px`, ...options },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, inView }
}
