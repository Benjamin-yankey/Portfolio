/** Mutated every frame inside the Canvas and written to by the keyboard
 *  handler outside it — a plain ref, not React state, since none of this
 *  has business re-rendering anything on its own. */
export interface CarState {
  x: number
  z: number
  /** Radians. Direction vector is (sin(heading), cos(heading)) — heading 0
   *  points toward +Z, matching the convention used by the splash toy's
   *  Math.atan2(dx, dz), so a heading of π faces -Z, where the field of
   *  markers sits. */
  heading: number
  /** Signed — negative is reverse. */
  speed: number
  nearIndex: number | null
}

export function createCarState(): CarState {
  return { x: 0, z: 0, heading: Math.PI, speed: 0, nearIndex: null }
}

export interface KeyState {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
}

export function createKeyState(): KeyState {
  return { forward: false, backward: false, left: false, right: false }
}
