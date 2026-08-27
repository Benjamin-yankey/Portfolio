import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { Project } from '../../data/projects'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { isCapableDevice, supportsWebGL } from '../../lib/webgl'
import { createRoamState } from './roam'
import { ExploreHint } from './ExploreHint'
import { ExploreBillboard } from './ExploreBillboard'

// Same reasoning as the Home hero's scene split: three + fiber are a large
// chunk that should never load until the checks below say it's worth it.
const ExploreScene = lazy(() => import('./ExploreScene'))

interface ExploreSceneMountProps {
  projects: Project[]
}

/**
 * Gates the Explore toy behind the same capability checks as the Home
 * hero's scene (WebGL support, a hover-capable/multi-core device, no
 * reduced-motion, a live frame-rate check once running) and fades it in
 * over whatever static fallback the caller already renders underneath —
 * here, Splash's ghost monogram. There is deliberately no loading state:
 * the fallback already looks complete on its own, so this either arrives
 * as a bonus or never arrives and nothing is missing.
 */
export function ExploreSceneMount({ projects }: Readonly<ExploreSceneMountProps>) {
  const prefersReduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [tooSlow, setTooSlow] = useState(false)
  const roamRef = useRef(createRoamState())
  const billboardRef = useRef<HTMLDivElement>(null)
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

  if (!ready) return null

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-0 animate-[scene-fade-in_1200ms_var(--ease-editorial)_forwards] opacity-0"
      onPointerDown={() => setHasInteracted(true)}
    >
      <Suspense fallback={null}>
        <ExploreScene
          projects={projects}
          roamRef={roamRef}
          onNearChange={setNearIndex}
          onTooSlow={() => setTooSlow(true)}
          billboardRef={billboardRef}
        />
      </Suspense>
      <ExploreBillboard
        outerRef={billboardRef}
        project={nearIndex !== null ? projects[nearIndex] : null}
      />
      <ExploreHint showHint={!hasInteracted} />
    </div>
  )
}
