import type { ElementType, ReactNode, Ref } from 'react'
import { useInView } from '../hooks/useInView'

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
 * Passes through any other props (href, onClick, etc.) to the rendered tag.
 */
export function Reveal({ as, delay = 0, className = '', children, ...rest }: Readonly<RevealProps>) {
  const Tag = (as ?? 'div') as ElementType
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <Tag
      ref={ref as Ref<never>}
      className={[
        'transition-all duration-[900ms] ease-editorial',
        DELAY_CLASSES[delay],
        inView ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0',
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
