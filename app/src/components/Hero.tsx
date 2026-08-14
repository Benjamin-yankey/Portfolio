import { Link } from 'react-router-dom'
import { site } from '../data/site'
import { HeroBadge } from './HeroBadge'
import { HeroCodeCard } from './HeroCodeCard'
import { HeroMarquee } from './HeroMarquee'
import { HeroSceneMount } from './hero-scene/HeroSceneMount'
import { Reveal } from './Reveal'
import { TechMarquee } from './TechMarquee'
import { GithubShowcase } from './GithubShowcase'

/**
 * The Home page, routed at `/home`. Two parts, not one centered void: the
 * pitch (who, what, and a way forward) on one side, the portrait on the
 * other — both sitting over the marquee/wireframe backdrop rather than
 * floating alone in it. Followed by a second, deliberately different toy
 * showing real GitHub repos.
 */
export function Hero() {
  return (
    <>
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Depth order, back to front: the WebGL sheet, the Z-layered type,
            then the foreground content. The scene sits behind the marquee
            rather than over it so the marquee stays the backdrop and the
            mesh stays atmosphere. */}
        <HeroSceneMount />
        <HeroMarquee />

        {/* One flex child on the section (this wrapper) keeps `items-center`
            vertically centering the whole intro within the viewport; the
            code card row stacks *inside* it via flex-col rather than as a
            second sibling, which the row-direction section would otherwise
            place beside the first row instead of under it. */}
        <div className="container-page relative z-10 flex flex-col gap-12 py-32 lg:py-24">
          <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <div className="relative max-w-[48ch] text-center lg:text-left">
              {/* Soft scrim behind the copy: the wireframe mesh and the marquee
                  type sit at roughly the same low-contrast grey as the text
                  itself, so without this the type reads as one tangle rather
                  than foreground-over-background. A blurred, oversized, same-
                  color (cream) patch reads as quieted paper rather than a card
                  — a hard-edged box here would look like the exact "photo in a
                  box" treatment we just removed from the portrait. */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-8 -inset-y-10 -z-10 rounded-[3rem] bg-cream/85 blur-3xl sm:-inset-x-14 sm:-inset-y-14"
              />
              <Reveal as="p" className="eyebrow mb-5">
                {site.eyebrow}
              </Reveal>
              <Reveal
                as="h1"
                delay={1}
                className="mb-5 font-serif text-[clamp(2.8rem,7vw,5.2rem)] leading-[1.02] tracking-[-0.01em]"
              >
                {site.name}
              </Reveal>
              <Reveal as="p" delay={2} className="mb-9 text-[1.05rem] leading-[1.7] text-ink-soft">
                {site.role} — {site.tagline}
              </Reveal>
              <Reveal as="div" delay={3} className="flex justify-center lg:justify-start">
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-2.5 rounded-full bg-ink px-7.5 py-4 text-[13px] font-semibold tracking-[0.1em] text-cream uppercase transition-all duration-[350ms] ease-editorial hover:-translate-y-1 hover:bg-ink-soft"
                >
                  View the work <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            </div>

            <HeroBadge />
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroCodeCard />
          </div>
        </div>
      </section>

      <TechMarquee />
      <GithubShowcase />
    </>
  )
}
