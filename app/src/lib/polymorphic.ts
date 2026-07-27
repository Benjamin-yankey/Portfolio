import type { ReactNode } from 'react'

/**
 * The tag type for our `as`-style polymorphic components (Reveal, Tilt3D).
 *
 * React's own `ElementType` is a union of every valid tag, and TypeScript
 * types a JSX element's props as the *intersection* across that union. That
 * intersection is normally rescued by the `ComponentType<any>` member, which
 * widens it back to `any` — but @react-three/fiber augments the global JSX
 * namespace with several hundred three.js elements whose props share no
 * common shape, and the intersection collapses to `never`. Every attribute
 * on the rendered tag then fails with "not assignable to type 'never'".
 *
 * Treating the resolved tag as a component with open-ended props sidesteps
 * an intersection that no longer means anything. The wrappers' own props
 * (`as`, `delay`, `depth`, `maxTilt`, …) stay fully typed at their call
 * sites; only the forwarded pass-through props go unchecked, which is what
 * `[prop: string]: unknown` already implied.
 */
export type PolymorphicTag = (props: Record<string, unknown>) => ReactNode
