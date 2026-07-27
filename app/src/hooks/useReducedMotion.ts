import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Reactive `prefers-reduced-motion`. useInView reads the same preference but
 * only once, at observe time — the 3D effects run continuously, so they need
 * to notice if the user flips the setting mid-session and stop moving.
 */
export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const query = window.matchMedia(QUERY)
    const onChange = () => setPrefersReduced(query.matches)

    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}
