import { useEffect, useRef } from 'react'
import { useReducedMotion } from './useReducedMotion'

interface PointerTiltOptions {
  /** Peak rotation, in degrees, at the element's edges. */
  maxTilt?: number
  /** How far the plane pops toward the viewer while hovered, in px. */
  lift?: number
  /** Fraction of the remaining distance covered per frame (0–1). */
  ease?: number
}

/**
 * Pointer-driven 3D tilt. Attach the returned ref to the *hover area*; it
 * writes `--tilt-x` / `--tilt-y` / `--lift` (consumed by the `plane-3d`
 * utility) plus `--pointer-x` / `--pointer-y` for sheen gradients.
 *
 * Values are written straight to the element's style inside a rAF loop
 * rather than held in React state: a re-render per pointermove would be
 * both wasteful and visibly janky. The loop eases the current value toward
 * the target and parks itself once settled, so an idle card costs nothing.
 */
export function usePointerTilt<T extends HTMLElement>({
  maxTilt = 8,
  lift = 0,
  ease = 0.14,
}: PointerTiltOptions = {}) {
  const ref = useRef<T | null>(null)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    // Tilt is a hover affordance. On touch there is no hover to drive it, and
    // binding it to touchmove would fight the user's scrolling.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let targetTiltX = 0
    let targetTiltY = 0
    let targetLift = 0
    let tiltX = 0
    let tiltY = 0
    let currentLift = 0
    let frame = 0

    function render() {
      tiltX += (targetTiltX - tiltX) * ease
      tiltY += (targetTiltY - tiltY) * ease
      currentLift += (targetLift - currentLift) * ease

      el!.style.setProperty('--tilt-x', `${tiltX.toFixed(3)}deg`)
      el!.style.setProperty('--tilt-y', `${tiltY.toFixed(3)}deg`)
      el!.style.setProperty('--lift', `${currentLift.toFixed(2)}px`)

      const settled =
        Math.abs(targetTiltX - tiltX) < 0.01 &&
        Math.abs(targetTiltY - tiltY) < 0.01 &&
        Math.abs(targetLift - currentLift) < 0.05

      frame = settled ? 0 : requestAnimationFrame(render)
    }

    function wake() {
      if (!frame) frame = requestAnimationFrame(render)
    }

    function onPointerMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      // -1 (left/top edge) … 1 (right/bottom edge), measured from the center.
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1

      // Pointer to the right swings the right edge away; pointer low tips the
      // bottom edge toward the viewer — i.e. the surface leans into the cursor.
      targetTiltY = nx * maxTilt
      targetTiltX = -ny * maxTilt
      targetLift = lift

      el!.style.setProperty('--pointer-x', `${(nx * 50 + 50).toFixed(2)}%`)
      el!.style.setProperty('--pointer-y', `${(ny * 50 + 50).toFixed(2)}%`)
      wake()
    }

    function rest() {
      targetTiltX = 0
      targetTiltY = 0
      targetLift = 0
      wake()
    }

    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerleave', rest)
    // A pointer can leave without a leave event when the element scrolls out
    // from under it or the window loses focus.
    el.addEventListener('pointercancel', rest)
    window.addEventListener('blur', rest)

    return () => {
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerleave', rest)
      el.removeEventListener('pointercancel', rest)
      window.removeEventListener('blur', rest)
      if (frame) cancelAnimationFrame(frame)
      for (const prop of ['--tilt-x', '--tilt-y', '--lift', '--pointer-x', '--pointer-y']) {
        el.style.removeProperty(prop)
      }
    }
  }, [maxTilt, lift, ease, prefersReduced])

  return ref
}
