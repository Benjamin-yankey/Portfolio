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

const ROWS = [
  { key: 'row-1', phrase: PHRASES[0], direction: 'left' as const, size: 'text-[clamp(4rem,13vw,10rem)]', duration: '110s' },
  { key: 'row-2', phrase: PHRASES[1], direction: 'right' as const, size: 'text-[clamp(3rem,9vw,7rem)]', duration: '140s' },
  { key: 'row-3', phrase: PHRASES[2], direction: 'left' as const, size: 'text-[clamp(2.2rem,6.5vw,5rem)]', duration: '90s' },
  { key: 'row-4', phrase: PHRASES[3], direction: 'right' as const, size: 'text-[clamp(2.6rem,7.5vw,6rem)]', duration: '125s' },
  { key: 'row-5', phrase: PHRASES[4], direction: 'left' as const, size: 'text-[clamp(1.8rem,5vw,4rem)]', duration: '75s' },
]

function MarqueeRow({ phrase, direction, size, duration }: Readonly<Omit<(typeof ROWS)[number], 'key'>>) {
  const segment = phrase.repeat(8)
  return (
    <div className="flex whitespace-nowrap">
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
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-center gap-6 overflow-hidden opacity-[0.16]"
    >
      {ROWS.map(({ key, ...row }) => (
        <MarqueeRow key={key} {...row} />
      ))}
    </div>
  )
}
