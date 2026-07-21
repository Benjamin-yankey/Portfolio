import { navItems } from '../data/nav'

interface HeroBadgeProps {
  onOpenMenu: () => void
  onNavigate: (target: string) => void
}

// Hand-placed, percentage-based coordinates for a small "subway map" of the
// site's sections — a gentle zigzag down the panel rather than a straight
// list, so it reads as a route/map rather than a plain menu. Labels are
// anchored to whichever side has more room (toward the panel's center)
// so they don't run off the rounded glass edge.
const MAP_NODES = navItems.map((item, i) => ({
  ...item,
  x: [30, 62, 28, 64, 30, 58][i] ?? 45,
  y: [10, 25, 42, 58, 75, 90][i] ?? 50,
}))

const PATH_D = MAP_NODES.map((node, i) => `${i === 0 ? 'M' : 'L'} ${node.x},${node.y}`).join(' ')

export function HeroBadge({ onOpenMenu, onNavigate }: Readonly<HeroBadgeProps>) {
  return (
    <div className="relative aspect-[4/5] w-[clamp(260px,42vw,480px)] shrink-0">
      {/* Background layer: clicking anywhere on the glass that isn't a map
          node opens the site's full nav overlay. Sits *under* the node
          buttons (z-0 vs the diagram's z-10), and the diagram wrapper is
          pointer-events-none so clicks pass through to this button except
          where a node button explicitly re-enables pointer-events. */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Open site navigation"
        className="absolute inset-0 z-0 rounded-[28px] border border-white/60 bg-white/25 shadow-[0_16px_48px_rgba(26,26,26,0.16)] backdrop-blur-md transition-all duration-300 ease-editorial hover:bg-white/35 hover:shadow-[0_20px_56px_rgba(26,26,26,0.2)] focus-visible:bg-white/35"
      />

      {/* Foreground layer: the route-map diagram — a connecting line plus a
          clickable node per section, each scrolling straight there. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible"
        >
          <path d={PATH_D} fill="none" stroke="var(--color-ink-soft)" strokeOpacity="0.35" strokeWidth="0.6" />
        </svg>

        {MAP_NODES.map((node) => {
          const labelOnRight = node.x < 50
          return (
            <button
              key={node.target}
              type="button"
              onClick={() => onNavigate(node.target)}
              className={`group pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 ${
                labelOnRight ? 'flex-row' : 'flex-row-reverse'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <span
                aria-hidden="true"
                className="block h-[7px] w-[7px] shrink-0 rounded-full bg-ink-soft/70 transition-transform duration-200 ease-editorial group-hover:scale-125 group-focus-visible:scale-125"
              />
              <span className="font-sans text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-ink-soft/80 uppercase transition-opacity duration-200 ease-editorial group-hover:text-ink group-focus-visible:text-ink">
                {node.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
