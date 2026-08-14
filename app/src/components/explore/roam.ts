export interface Point {
  x: number
  z: number
}

export const WALK_SPEED = 2.6 // world units per second
const ARRIVE_EPSILON = 0.05
export const MARKER_RADIUS = 1.15

/** Meander layout for the project markers — same zigzag idea as the hero
 *  badge's subway map, scaled down to fit a side panel instead of a full
 *  page. */
export function buildMarkerPositions(count: number): Point[] {
  const SPACING_Z = 3.2
  const MEANDER_X = 1.8
  return Array.from({ length: count }, (_, i) => ({
    x: (i % 2 === 0 ? 1 : -1) * MEANDER_X,
    z: -(i + 1) * SPACING_Z - 1,
  }))
}

/** Mutated every frame inside the Canvas (position, facing, which marker is
 *  nearby) and written to from outside it (a click sets a new target) — a
 *  plain ref, not React state, since none of this has business re-rendering
 *  anything on its own. */
export interface RoamState {
  x: number
  z: number
  targetX: number
  targetZ: number
  /** Normalized last-known walking direction, used to orient both the
   *  avatar and the camera. A unit vector rather than an angle: deriving
   *  the camera's behind-and-above offset straight from (dirX, dirZ) is one
   *  fewer sin/cos round-trip than going through atan2 and back, and one
   *  fewer place to get a sign backwards. */
  dirX: number
  dirZ: number
  nearIndex: number | null
}

export function createRoamState(): RoamState {
  // Every marker sits at negative z, so the camera needs to be looking that
  // way from the very first frame — before any click has set a direction —
  // or the opening shot faces the wrong way entirely.
  return { x: 0, z: 0, targetX: 0, targetZ: 0, dirX: 0, dirZ: -1, nearIndex: null }
}

export function setWalkTarget(roam: RoamState, point: Point) {
  roam.targetX = point.x
  roam.targetZ = point.z
}

export function isArrived(roam: RoamState): boolean {
  return Math.hypot(roam.targetX - roam.x, roam.targetZ - roam.z) < ARRIVE_EPSILON
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
