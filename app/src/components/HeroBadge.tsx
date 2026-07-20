const ORBIT_PHRASE = 'DEVOPS ENGINEER · AWS · KUBERNETES · TERRAFORM · '
const ORBIT_RADIUS = 122
// SVG textPath doesn't wrap text around a closed path more than once — it
// just clips whatever overflows the path length, which (since the path
// loops back on itself) lands the cut mid-word right next to the string's
// own start. Pinning `textLength` to the path's exact circumference and
// letting `lengthAdjust="spacingAndGlyphs"` retime the spacing guarantees
// the string spans the loop exactly, so every seam falls on "· " → "D",
// never mid-word. Two repeats keeps the natural length close to the
// circumference so that respacing stays subtle.
const ORBIT_TEXT = ORBIT_PHRASE.repeat(2)
const ORBIT_CIRCUMFERENCE = 2 * Math.PI * ORBIT_RADIUS

export function HeroBadge() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-square w-[200px] shrink-0 sm:w-[240px] lg:w-[280px]"
    >
      {/* Soft ambient glow so the glass panel has something to refract */}
      <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-cream-deep via-muted-faint/50 to-transparent blur-2xl" />

      {/* Slowly rotating ring of type */}
      <svg viewBox="0 0 280 280" className="absolute inset-0 h-full w-full origin-center animate-spin-slow">
        <defs>
          <path
            id="heroOrbitPath"
            d={`M 140,140 m -${ORBIT_RADIUS},0 a ${ORBIT_RADIUS},${ORBIT_RADIUS} 0 1,1 ${ORBIT_RADIUS * 2},0 a ${ORBIT_RADIUS},${ORBIT_RADIUS} 0 1,1 -${ORBIT_RADIUS * 2},0`}
          />
        </defs>
        <text
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '10.5px',
            fontWeight: 600,
            fill: 'var(--color-ink-soft)',
            opacity: 0.55,
          }}
        >
          <textPath
            href="#heroOrbitPath"
            xlinkHref="#heroOrbitPath"
            textLength={ORBIT_CIRCUMFERENCE}
            lengthAdjust="spacingAndGlyphs"
          >
            {ORBIT_TEXT}
          </textPath>
        </text>
      </svg>

      {/* Frosted-glass panel — drop a photo in here later */}
      <div className="absolute inset-[24%] flex items-center justify-center rounded-full border border-white/60 bg-white/25 shadow-[0_8px_32px_rgba(26,26,26,0.14)] backdrop-blur-md">
        <span className="font-serif text-[clamp(1.5rem,4vw,2.2rem)] text-ink-soft/85">BY</span>
      </div>
    </div>
  )
}
