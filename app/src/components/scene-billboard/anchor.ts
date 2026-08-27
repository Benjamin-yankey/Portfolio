import type { Camera, Vector3 } from 'three'

interface AnchorOptions {
  /** Screen-space floor for the anchor, in CSS px. Use when the card hangs
   *  *upward* from the anchor and would otherwise clip off the top of a
   *  short panel. Leave at 0 when the card sits directly on its anchor. */
  clearance?: number
}

/**
 * Projects a world-space point into the panel's screen space and writes the
 * result straight to a DOM element's `transform`.
 *
 * The write goes to `style` rather than through React on purpose: what a
 * card *says* changes a handful of times per visit, but where it *is*
 * changes every frame, and routing the latter through state would re-render
 * the card sixty times a second to move it a few pixels.
 *
 * `point` is projected in place — pass a scratch Vector3 held in a ref, not
 * a fresh one per frame.
 */
export function writeAnchor(
  el: HTMLElement | null,
  point: Vector3,
  camera: Camera,
  size: { width: number; height: number },
  { clearance = 0 }: AnchorOptions = {},
) {
  if (!el) return

  point.project(camera)

  // NDC: z > 1 is behind the near plane, |x| > 1 is off the side. Both
  // would otherwise smear the card against a panel edge, where it reads as
  // a label for whatever it happens to be sitting on.
  if (point.z > 1 || Math.abs(point.x) > 1.1) {
    el.style.opacity = '0'
    return
  }

  el.style.opacity = '1'

  const x = (point.x * 0.5 + 0.5) * size.width
  const y = (-point.y * 0.5 + 0.5) * size.height
  el.style.transform = `translate3d(${x.toFixed(1)}px, ${Math.max(y, clearance).toFixed(1)}px, 0)`
}
