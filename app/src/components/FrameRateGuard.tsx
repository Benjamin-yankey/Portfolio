import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const WARMUP_SECONDS = 1
const SAMPLE_SECONDS = 2
const MIN_ACCEPTABLE_FPS = 30

interface FrameRateGuardProps {
  onTooSlow: () => void
}

/**
 * Measures a scene's actual frame rate once and, if the machine can't keep
 * up, asks to be removed. Drop into any Canvas alongside the scene it should
 * guard.
 *
 * The static capability checks upstream (see lib/webgl.ts) can't see this: a
 * browser that reports WebGL support may still be rasterizing in software (a
 * VM, a blocklisted driver), where a scene's fill cost drops the whole page
 * to single-digit frames. A page that stutters is worse than one without the
 * effect, so the effect is what gives way.
 */
export function FrameRateGuard({ onTooSlow }: Readonly<FrameRateGuardProps>) {
  const elapsed = useRef(0)
  const frames = useRef(0)
  const settled = useRef(false)

  useFrame((_, delta) => {
    if (settled.current) return
    elapsed.current += delta

    // Skip the first second: shader compilation and the initial upload make
    // the opening frames unrepresentative of the steady state.
    if (elapsed.current < WARMUP_SECONDS) return
    frames.current++
    if (elapsed.current < WARMUP_SECONDS + SAMPLE_SECONDS) return

    settled.current = true
    if (frames.current / SAMPLE_SECONDS < MIN_ACCEPTABLE_FPS) onTooSlow()
  })

  return null
}
