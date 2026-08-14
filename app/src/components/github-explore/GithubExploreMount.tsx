import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { GithubProject } from '../../data/githubProjects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isCapableDevice, supportsWebGL } from '../../lib/webgl'
import { createCarState } from './carState'
import { GithubExploreHint } from './GithubExploreHint'
import { GithubExploreFallback } from './GithubExploreFallback'

const GithubExploreScene = lazy(() => import('./GithubExploreScene'))

interface GithubExploreMountProps {
  projects: GithubProject[]
}

/**
 * Gates the colorful GitHub toy behind the same capability checks as every
 * other WebGL scene on this site, and owns the car's mutable drive state.
 * Unlike the hero's decorative wireframe, this is real content (real
 * repos), so failing a check swaps in `GithubExploreFallback` rather than
 * rendering nothing — no ghost monogram here, just an honest list of the
 * same links.
 */
export function GithubExploreMount({ projects }: Readonly<GithubExploreMountProps>) {
  const prefersReduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [tooSlow, setTooSlow] = useState(false)
  const carRef = useRef(createCarState())
  // Whether the panel is hovered or focused — gates the keyboard listener
  // so WASD/arrows only drive the car while a visitor is actually engaging
  // with it, not hijacking scroll/keyboard nav for the rest of the page.
  const activeRef = useRef(false)
  const [nearIndex, setNearIndex] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    if (prefersReduced || tooSlow) {
      setReady(false)
      return
    }
    if (!isCapableDevice() || !supportsWebGL()) return

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

  if (!ready) {
    return (
      <div className="container-page py-10">
        <GithubExploreFallback projects={projects} />
      </div>
    )
  }

  const activeProject = nearIndex !== null ? { ...projects[nearIndex], index: nearIndex } : null

  return (
    <div
      tabIndex={0}
      role="application"
      aria-label="Drivable map of GitHub projects — use arrow keys or WASD"
      className="relative h-[88vh] min-h-[620px] w-full overflow-hidden focus:outline-none"
      // Green throughout, not sky blue and not washed-out near-white —
      // meant to read as distant land fading toward the horizon, matching
      // the hemisphere light's sky-color tint in the scene.
      style={{ background: 'linear-gradient(to bottom, #b9cf95 0%, #93bd6e 45%, #6fa25a 100%)' }}
      onPointerEnter={() => {
        activeRef.current = true
      }}
      onPointerLeave={() => {
        activeRef.current = false
      }}
      onFocus={() => {
        activeRef.current = true
      }}
      onBlur={() => {
        activeRef.current = false
      }}
    >
      <Suspense fallback={null}>
        <GithubExploreScene
          projects={projects}
          carRef={carRef}
          activeRef={activeRef}
          onNearChange={setNearIndex}
          onFirstInput={() => setHasInteracted(true)}
          onTooSlow={() => setTooSlow(true)}
        />
      </Suspense>
      <GithubExploreHint project={activeProject} showHint={!hasInteracted} />
    </div>
  )
}
