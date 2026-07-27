import { Suspense, lazy, useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

// three + @react-three/fiber are roughly half a megabyte — an order of
// magnitude more than the rest of the site put together. Splitting them into
// their own chunk here means the initial bundle never pays for them; the
// import isn't even requested until the checks below pass.
const HeroScene = lazy(() => import('./HeroScene'))

/** Cheap feature probe: build a throwaway context and immediately drop it. */
function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * Desktop only, and deliberately so. The scene's cost is a ~235 kB chunk
 * plus a GPU redraw every frame for as long as the hero is on screen —
 * spent on a phone that is likely metered and on battery, for an effect
 * whose pointer interaction can't even be used without a cursor. The CSS
 * hero is the whole experience on touch, and it loses nothing by it.
 */
function isCapableDevice() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false
  const cores = navigator.hardwareConcurrency
  return cores === undefined || cores >= 4
}

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
