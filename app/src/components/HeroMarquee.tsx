const LINE_PHRASE =
  'DEVOPS ENGINEER · AWS · AZURE · GCP · KUBERNETES · DOCKER · TERRAFORM · ANSIBLE · JENKINS · ARGOCD · CI/CD · PROMETHEUS · GRAFANA · LINUX · PYTHON · BASH · SRE · OBSERVABILITY · '
// One "segment" needs to be wide enough to outrun the widest realistic
// viewport, since the marquee loop shifts by exactly one segment's width
// (translateX(-50%) of a two-segment-wide row) — if a segment were narrower
// than the viewport, the seam would be visible on screen at all times
// instead of scrolling off both edges.
const SEGMENT = LINE_PHRASE.repeat(3)

const ROWS = [
  { key: 'row-1', direction: 'left' as const, size: 'text-[clamp(4rem,13vw,10rem)]', duration: '110s' },
  { key: 'row-2', direction: 'right' as const, size: 'text-[clamp(3rem,9vw,7rem)]', duration: '140s' },
  { key: 'row-3', direction: 'left' as const, size: 'text-[clamp(2.2rem,6.5vw,5rem)]', duration: '90s' },
]

function MarqueeRow({ direction, size, duration }: Readonly<Omit<(typeof ROWS)[number], 'key'>>) {
  return (
    <div className="flex whitespace-nowrap">
      <div
        className={`flex shrink-0 ${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'}`}
        style={{ animationDuration: duration }}
      >
        <span className={`font-serif ${size} pr-16 leading-none font-semibold tracking-tight text-black`}>
          {SEGMENT}
        </span>
        <span
          className={`font-serif ${size} pr-16 leading-none font-semibold tracking-tight text-black`}
          aria-hidden="true"
        >
          {SEGMENT}
        </span>
      </div>
    </div>
  )
}

export function HeroMarquee() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-8 overflow-hidden opacity-[0.16]"
    >
      {ROWS.map(({ key, ...row }) => (
        <MarqueeRow key={key} {...row} />
      ))}
    </div>
  )
}
