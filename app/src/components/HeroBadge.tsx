import type { CSSProperties } from 'react'
import { usePointerTilt } from '../hooks/usePointerTilt'
import { site } from '../data/site'

/**
 * The hero's portrait: background-removed, standing directly in the scene
 * with no card or border around it. Purely presentational — navigation
 * lives in the persistent top bar, not hidden behind a click on someone's
 * face — so this is just a tilt-responsive image, the same hover language
 * as the skill cards elsewhere on the site.
 */
export function HeroBadge() {
  const sceneRef = usePointerTilt<HTMLDivElement>({ maxTilt: 9, lift: 22 })

  return (
    <div
      ref={sceneRef}
      className="scene-3d relative aspect-[4/5] w-[clamp(220px,36vw,380px)] shrink-0"
      style={{ '--scene-perspective': '900px' } as CSSProperties}
    >
      <div className="plane-3d absolute inset-0">
        {/* Soft presence shadow. There's no floor in frame for the figure to
            cast a contact shadow onto, so this is just enough blurred depth
            behind it to keep it from reading as a sticker on the page. */}
        <div
          aria-hidden="true"
          className="layer-3d absolute inset-6 rounded-[50%] bg-ink/10 blur-2xl"
          style={{ '--layer-z': '-40px' } as CSSProperties}
        />
        {site.heroVideo ? (
          <video
            src={site.heroVideo}
            autoPlay
            muted
            loop
            playsInline
            className="relative h-full w-full object-cover drop-shadow-[0_20px_32px_rgba(26,26,26,0.25)]"
          />
        ) : (
          <img
            src={site.portrait}
            alt={site.name}
            className="relative h-full w-full object-cover drop-shadow-[0_20px_32px_rgba(26,26,26,0.25)]"
          />
        )}
      </div>
    </div>
  )
}
