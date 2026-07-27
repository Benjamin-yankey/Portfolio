import { useOutletContext } from 'react-router-dom'
import { site } from '../data/site'
import type { PageContext } from './Layout'
import { HeroBadge } from './HeroBadge'
import { HeroMarquee } from './HeroMarquee'
import { HeroSceneMount } from './hero-scene/HeroSceneMount'

/** The Home page, routed at `/`. */
export function Hero() {
  const { openMenu, goTo } = useOutletContext<PageContext>()

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* The hero is a deliberately text-free "cover" screen — just the
          moving background type and a centered glass frame. The name/role
          still exist in the document (for SEO/a11y and screen readers) via
          a visually-hidden heading; sighted users meet them properly by
          following the map to the other pages. */}
      <h1 className="sr-only">
        {site.name} — {site.role}
      </h1>
      {/* Depth order, back to front: the WebGL sheet, the Z-layered type,
          then the glass badge. The scene sits behind the marquee rather
          than over it so the type stays the hero's subject and the mesh
          stays atmosphere. */}
      <HeroSceneMount />
      <HeroMarquee />
      <div className="relative z-10">
        <HeroBadge onOpenMenu={openMenu} onNavigate={goTo} />
      </div>
    </section>
  )
}
