import { Suspense, lazy, useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isCapableDevice, supportsWebGL } from '../../lib/webgl'

// three + @react-three/fiber are roughly half a megabyte — an order of
// magnitude more than the rest of the site put together. Splitting them into
// their own chunk here means the initial bundle never pays for them; the
// import isn't even requested until the checks below pass.
const HeroScene = lazy(() => import('./HeroScene'))

/**
 * Decides whether the WebGL hero gets to exist at all, and delays it until
 * the page is already usable.
 *
 * The CSS hero is not a placeholder for this — it is the real hero, and it
 * stands alone whenever the scene is skipped. So there is deliberately no
 * loading state and no layout reservation: the canvas fades in over a hero
 * that was already complete, or it never arrives and nothing is missing.
 */
export function HeroSceneMount() {
  const prefersReduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  // Latched, never reset: once a machine has demonstrated it can't render
  // the scene smoothly, remounting it on the next effect run would just
  // repeat the stutter and the measurement.
  const [tooSlow, setTooSlow] = useState(false)

  useEffect(() => {
    if (prefersReduced || tooSlow) {
      setReady(false)
      return
    }
    if (!isCapableDevice() || !supportsWebGL()) return

    // A continuously animating GPU scene is the wrong thing to be doing
    // while the browser is still laying out and painting text.
    // requestIdleCallback waits for genuine slack; the timeout is the floor
    // for busy machines where idle never arrives. Safari only shipped
    // requestIdleCallback recently, hence the setTimeout fallback.
    let idle = 0
    let timer = 0
    const start = () => setReady(true)

    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(start, { timeout: 2500 })
    } else {
      timer = window.setTimeout(start, 900)
    }

    return () => {
      if (idle) window.cancelIdleCallback(idle)
      if (timer) window.clearTimeout(timer)
    }
  }, [prefersReduced, tooSlow])

  if (!ready) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 animate-[scene-fade-in_1200ms_var(--ease-editorial)_forwards] opacity-0"
    >
      <Suspense fallback={null}>
        <HeroScene onTooSlow={() => setTooSlow(true)} />
      </Suspense>
    </div>
  )
}
