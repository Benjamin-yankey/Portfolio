import type { CSSProperties, ReactNode } from 'react'

interface SceneBillboardProps {
  /** Written to every frame by the owning scene's frame loop, via
   *  `writeAnchor`. Kept as a raw DOM handle so per-frame motion never
   *  touches React's render path. */
  outerRef: React.RefObject<HTMLDivElement | null>
  visible: boolean
  /** Length of the hairline down to whatever the card labels, in CSS px.
   *  Only correct for a subject the camera holds at a fixed distance — for
   *  anything the camera can approach, anchor the card *on* the subject and
   *  leave this at 0, since a fixed pixel length would detach as the subject
   *  scales with distance. */
  tetherPx?: number
  /** Colour of the left edge rule, when the card belongs to something that
   *  already has an identifying colour in the scene. */
  accent?: string
  /** Sizing / spacing for the card itself. */
  cardClassName?: string
  children: ReactNode
}

/**
 * The shared mechanics behind every in-scene info card on this site: an
 * outer element the frame loop moves, an inner card that fades and rises on
 * its own, and an optional tether down to the subject.
 *
 * Rendered as DOM over the Canvas rather than as an in-scene sprite. The
 * text is small, and a canvas-texture billboard would mean hand-rolled word
 * wrap and blurry glyphs, where this gets the site's real typography —
 * subpixel-crisp at any zoom — for free. It is effectively drei's `<Html>`,
 * minus the dependency.
 *
 * The two nested elements are load-bearing: the outer one carries the
 * per-frame screen-space translate, the inner one owns the enter/exit
 * transition. On one element the CSS transition and the frame loop would
 * fight over `transform` every frame.
 */
export function SceneBillboard({
  outerRef,
  visible,
  tetherPx = 0,
  accent,
  cardClassName = 'w-[min(15rem,60vw)]',
  children,
}: Readonly<SceneBillboardProps>) {
  const accentStyle: CSSProperties | undefined = accent
    ? { borderLeftWidth: '4px', borderLeftColor: accent }
    : undefined

  return (
    <div
      ref={outerRef}
      aria-hidden="true"
      // z-20: above the villager name tags (z-10), below the controls
      // legend (z-30). A card the visitor asked for by pointing at something
      // should not end up underneath an ambient label.
      className="pointer-events-none absolute top-0 left-0 z-20 opacity-0 will-change-transform"
    >
      <div
        style={accentStyle}
        className={[
          'absolute bottom-0 left-0 -translate-x-1/2 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-[0_12px_32px_rgba(26,26,26,0.18)] backdrop-blur-md',
          'transition-[opacity,transform] duration-[400ms] ease-editorial',
          cardClassName,
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1.5 scale-95 opacity-0',
        ].join(' ')}
      >
        {children}
      </div>

      {tetherPx > 0 && (
        // Centring, offset and reveal all live in one inline transform: a
        // Tailwind `-translate-x-1/2` plus a `scale-y-*` class would each
        // compile to their own `transform` and clobber the other.
        <span
          style={{
            height: `${tetherPx}px`,
            transform: `translate(-50%, ${tetherPx}px) scaleY(${visible ? 1 : 0})`,
          }}
          className="absolute bottom-0 left-0 w-px origin-top bg-ink/30 transition-transform duration-[400ms] ease-editorial"
        />
      )}
    </div>
  )
}
