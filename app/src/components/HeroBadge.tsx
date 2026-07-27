import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { navItems } from '../data/nav'
import { usePointerTilt } from '../hooks/usePointerTilt'

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

interface HeroBadgeProps {
  onOpenMenu: () => void
  onNavigate: (path: string) => void
}

export function HeroBadge({ onOpenMenu, onNavigate }: Readonly<HeroBadgeProps>) {
  // Attached to the scene so the tilt is measured across the whole panel,
  // including the padding around the nodes.
  const sceneRef = usePointerTilt<HTMLDivElement>({ maxTilt: 11, lift: 26 })

  return (
    <div
      ref={sceneRef}
      className="scene-3d group relative aspect-[4/5] w-[clamp(260px,42vw,480px)] shrink-0"
      style={{ '--scene-perspective': '900px' } as CSSProperties}
    >
      <div className="plane-3d absolute inset-0">
        {/* Contact shadow. Kept on its own layer *behind* the glass and
            pushed back in Z so it stays put as the panel lifts away from it
            — a shadow welded to the card would just tilt with it and read as
            flat printing rather than a gap. */}
        <div
          aria-hidden="true"
          className="layer-3d absolute inset-x-4 -bottom-2 top-6 rounded-[28px] bg-ink/12 blur-2xl transition-opacity duration-500 ease-editorial group-hover:opacity-80"
          style={{ '--layer-z': '-60px' } as CSSProperties}
        />

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

        {/* Specular sheen tracking the cursor, so the glass catches light as
            it turns. Purely decorative and non-interactive. */}
        <div
          aria-hidden="true"
          className="layer-3d pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[28px] opacity-0 transition-opacity duration-500 ease-editorial group-hover:opacity-100"
          style={
            {
              '--layer-z': '2px',
              backgroundImage:
                'radial-gradient(420px circle at var(--pointer-x, 50%) var(--pointer-y, 50%), rgba(255,255,255,0.55), transparent 65%)',
            } as CSSProperties
          }
        />

        {/* Foreground layer: the route-map diagram — a connecting line plus a
            clickable node per section, each scrolling straight there. The
            line and the nodes sit at different depths so the map gains
            physical thickness as the panel rotates. */}
        <div className="pointer-events-none absolute inset-0 z-10 [transform-style:preserve-3d]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="layer-3d absolute inset-0 h-full w-full overflow-visible"
            style={{ '--layer-z': '22px' } as CSSProperties}
          >
            <path d={PATH_D} fill="none" stroke="var(--color-ink-soft)" strokeOpacity="0.35" strokeWidth="0.6" />
          </svg>

          {MAP_NODES.map((node) => {
            const labelOnRight = node.x < 50
            return (
              <Link
                key={node.path}
                to={node.path}
                onClick={(event) => {
                  event.preventDefault()
                  onNavigate(node.path)
                }}
                className={`group/node pointer-events-auto absolute flex items-center gap-2 ${
                  labelOnRight ? 'flex-row' : 'flex-row-reverse'
                }`}
                style={
                  {
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    // Centering and depth are one transform rather than a
                    // `layer-3d` class plus translate utilities: they'd all
                    // write the same property and the last one would win,
                    // silently dropping either the centering or the depth.
                    transform: 'translate(-50%, -50%) translateZ(48px)',
                  } as CSSProperties
                }
              >
                <span
                  aria-hidden="true"
                  className="block h-[7px] w-[7px] shrink-0 rounded-full bg-ink-soft/70 transition-transform duration-200 ease-editorial group-hover/node:scale-125 group-focus-visible/node:scale-125"
                />
                <span className="font-sans text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap text-ink-soft/80 uppercase transition-opacity duration-200 ease-editorial group-hover/node:text-ink group-focus-visible/node:text-ink">
                  {node.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
