import type { ElementType, ReactNode, Ref } from 'react'
import { useInView } from '../hooks/useInView'
import type { PolymorphicTag } from '../lib/polymorphic'

type RevealDelay = 0 | 1 | 2 | 3

const DELAY_CLASSES: Record<RevealDelay, string> = {
  0: '',
  1: 'delay-[80ms]',
  2: 'delay-[160ms]',
  3: 'delay-[240ms]',
}

interface RevealProps {
  as?: ElementType
  delay?: RevealDelay
  /**
   * Swing the content up through 3D space instead of sliding it flat. Reads
   * as the block rotating into place from below the viewer's eyeline.
   */
  depth?: boolean
  className?: string
  children?: ReactNode
  // Reveal is a thin polymorphic wrapper (as="div" | "a" | "h2" | ...), so it
  // forwards whatever other props the chosen tag needs (href, onClick, ...).
  [prop: string]: unknown
}

/**
 * Scroll-reveal wrapper: fades + slides content up once it enters the
 * viewport, matching the original `.reveal` / `.reveal.in-view` CSS pair
 * (driven there by a shared IntersectionObserver, here by useInView).
 * With `depth`, the slide becomes a rotation out of depth instead.
 * Passes through any other props (href, onClick, etc.) to the rendered tag.
 */
export function Reveal({
  as,
  delay = 0,
  depth = false,
  className = '',
  children,
  ...rest
}: Readonly<RevealProps>) {
  const Tag = (as ?? 'div') as PolymorphicTag
  const { ref, inView } = useInView<HTMLElement>()

  // The flat and 3D variants both animate `transform`, so only one may apply
  // its classes — Tailwind's translate utilities and `reveal-3d` would
  // otherwise overwrite each other depending on stylesheet order.
  const motion = depth
    ? ['reveal-3d', inView && 'reveal-3d-in']
    : [inView ? 'translate-y-0' : 'translate-y-7']

  return (
    <Tag
      ref={ref as Ref<never>}
      className={[
        'transition-all duration-[900ms] ease-editorial',
        DELAY_CLASSES[delay],
        ...motion,
        inView ? 'opacity-100' : 'opacity-0',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
