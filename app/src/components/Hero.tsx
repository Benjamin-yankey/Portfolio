import { site } from '../data/site'
import { HeroBadge } from './HeroBadge'
import { HeroMarquee } from './HeroMarquee'

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center justify-center overflow-hidden border-b border-line-soft"
    >
      {/* The hero is a deliberately text-free "cover" screen — just the
          moving background type and a centered glass frame. The name/role
          still exist in the document (for SEO/a11y and screen readers) via
          a visually-hidden heading; sighted users meet them properly in the
          sections below as they scroll. */}
      <h1 className="sr-only">
        {site.name} — {site.role}
      </h1>
      <HeroMarquee />
      <div className="relative z-10">
        <HeroBadge />
      </div>
    </section>
  )
}
