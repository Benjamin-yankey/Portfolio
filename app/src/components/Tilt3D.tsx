import type { CSSProperties, ElementType, ReactNode, Ref } from 'react'
import { usePointerTilt } from '../hooks/usePointerTilt'
import type { PolymorphicTag } from '../lib/polymorphic'

interface Tilt3DProps {
  as?: ElementType
  /** Peak rotation in degrees at the element's edges. */
  maxTilt?: number
  /** How far the surface pops toward the viewer while hovered, in px. */
  lift?: number
  /** Viewing distance. Smaller = stronger, more dramatic foreshortening. */
  perspective?: number
  /** Classes for the scene (the hover area — owns layout and spacing). */
  className?: string
  /** Classes for the plane (the surface that rotates — owns the visuals). */
  planeClassName?: string
  children?: ReactNode
  [prop: string]: unknown
}

/**
 * Pairs a perspective container with the surface that tilts inside it.
 *
 * The split matters: perspective has to live on an ancestor of the rotating
 * element, otherwise every card computes its vanishing point from its own
 * center and a row of them all lean identically instead of fanning out from
 * a shared viewpoint. So `className` styles the outer scene and
 * `planeClassName` styles the inner surface.
 */
export function Tilt3D({
  as,
  maxTilt = 7,
  lift = 0,
  perspective = 1200,
  className = '',
  planeClassName = '',
  children,
  ...rest
}: Readonly<Tilt3DProps>) {
  const Tag = (as ?? 'div') as PolymorphicTag
  const ref = usePointerTilt<HTMLElement>({ maxTilt, lift })

  return (
    <Tag
      ref={ref as Ref<never>}
      className={['scene-3d', className].filter(Boolean).join(' ')}
      style={{ '--scene-perspective': `${perspective}px` } as CSSProperties}
      {...rest}
    >
      <div className={['plane-3d h-full', planeClassName].filter(Boolean).join(' ')}>{children}</div>
    </Tag>
  )
}
