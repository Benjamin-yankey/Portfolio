import type { CSSProperties } from 'react'
import { useScrollDepth } from '../hooks/useScrollDepth'

// Five distinct phrases (grouped by theme) instead of one repeated line, so
// the marquee reads as genuinely varied content rather than one sentence
// looping five times. Each is repeated generously so a "segment" outruns
// the widest realistic viewport — the marquee loop shifts by exactly one
// segment's width (translateX(-50%) of a two-segment-wide row), so a
// too-short segment would leave the seam visible on screen at all times
// instead of scrolling off both edges.
const PHRASES = [
  'DEVOPS ENGINEER · AWS · AZURE · GCP · ',
  'KUBERNETES · DOCKER · TERRAFORM · ANSIBLE · ',
  'JENKINS · ARGOCD · CI/CD PIPELINES · ',
  'PROMETHEUS · GRAFANA · OBSERVABILITY · ',
  'LINUX · PYTHON · BASH · SRE · ',
]

// `z` scatters the rows through the scene's depth instead of leaving them
// on one flat pane. Two things follow from that, and both are intentional:
// perspective scales near rows up and far rows down, and equal translateX
// speeds now read as different apparent speeds — near rows sweep past while
// far rows creep. `opacity` layers atmospheric perspective on top, fading
// distance out so the stack has a legible front-to-back order.
const ROWS = [
  { key: 'row-1', phrase: PHRASES[0], direction: 'left' as const, size: 'text-[clamp(4rem,13vw,10rem)]', duration: '110s', z: 120, opacity: 1 },
  { key: 'row-2', phrase: PHRASES[1], direction: 'right' as const, size: 'text-[clamp(3rem,9vw,7rem)]', duration: '140s', z: -90, opacity: 0.62 },
  { key: 'row-3', phrase: PHRASES[2], direction: 'left' as const, size: 'text-[clamp(2.2rem,6.5vw,5rem)]', duration: '90s', z: 50, opacity: 0.9 },
  { key: 'row-4', phrase: PHRASES[3], direction: 'right' as const, size: 'text-[clamp(2.6rem,7.5vw,6rem)]', duration: '125s', z: -170, opacity: 0.48 },
  { key: 'row-5', phrase: PHRASES[4], direction: 'left' as const, size: 'text-[clamp(1.8rem,5vw,4rem)]', duration: '75s', z: 20, opacity: 0.8 },
]

function MarqueeRow({ phrase, direction, size, duration, z, opacity }: Readonly<Omit<(typeof ROWS)[number], 'key'>>) {
  const segment = phrase.repeat(8)
  return (
    <div
      className="flex whitespace-nowrap"
      style={{
        // --depth (0→1 as the hero scrolls away) pushes every row toward the
        // viewer by a multiple of its own depth, so near rows accelerate
        // past far ones and scrolling feels like moving through the stack.
        transform: `translateZ(calc(${z}px + var(--depth, 0) * ${z * 0.9}px))`,
        opacity,
      }}
    >
      <div
        className={`flex shrink-0 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: duration }}
      >
        <span className={`font-serif ${size} pr-16 leading-none font-semibold tracking-tight text-black`}>
          {segment}
        </span>
        <span
          className={`font-serif ${size} pr-16 leading-none font-semibold tracking-tight text-black`}
          aria-hidden="true"
        >
          {segment}
        </span>
      </div>
    </div>
  )
}

export function HeroMarquee() {
  const ref = useScrollDepth<HTMLDivElement>()

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="scene-3d pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.16]"
      style={{ '--scene-perspective': '760px' } as CSSProperties}
    >
      {/* The rows share one preserve-3d stack so they're composited against
          a single vanishing point — perspective on the parent alone would
          flatten each row back onto its own plane. The slight rotateX tips
          the whole stack away at the top, like reading a page laid on a
          desk rather than held square to the eye. */}
      <div className="flex h-full flex-col justify-center gap-6 [transform:rotateX(6deg)] [transform-style:preserve-3d]">
        {ROWS.map(({ key, ...row }) => (
          <MarqueeRow key={key} {...row} />
        ))}
      </div>
    </div>
  )
}
