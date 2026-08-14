import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../data/site'
import { navItems } from '../data/nav'
import { projects } from '../data/projects'
import { Reveal } from './Reveal'
import { PaperGrain } from './PaperGrain'
import { ExploreSceneMount } from './explore/ExploreSceneMount'

/** The other five stops, in order, named for the itinerary line below the
 *  description — Home is the destination this page leads to, not a stop
 *  past it. */
const STOPS = navItems.slice(1).map((item) => item.label)

/**
 * The site's front door: a single gate page at "/" that says what's inside
 * before handing off to the Home hub at "/home". Deliberately outside
 * `<Layout>` — no fixed top bar, no nav overlay, nothing that lets a visitor
 * wander before they've read the one screen that tells them what this is.
 */
export function Splash() {
  useEffect(() => {
    document.title = `${site.wordmark} — ${site.role}`
  }, [])

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <PaperGrain />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-16 px-6 py-8 sm:px-14 sm:py-10 lg:w-1/2 lg:gap-24 lg:py-14">
        <span
          className="font-serif text-xl leading-none tracking-[0.04em]"
          style={{ fontWeight: 500 }}
        >
          {site.wordmark}
        </span>

        <div className="max-w-[46ch]">
          <Reveal as="p" className="eyebrow mb-6">
            {site.eyebrow}
          </Reveal>
          <Reveal
            as="h1"
            delay={1}
            className="mb-6 font-serif text-[clamp(2.6rem,6vw,4.2rem)] leading-[1.05] tracking-[-0.01em]"
          >
            Before you go in.
          </Reveal>
          <Reveal as="p" delay={2} className="mb-8 text-[1.02rem] leading-[1.7] text-ink-soft">
            A short tour of how I build and run infrastructure — projects
            shipped, tools relied on daily, the roles behind them, notes
            along the way, and a way to reach me.
          </Reveal>
          <Reveal as="p" delay={2} className="mb-10 text-[0.85rem] tracking-[0.02em] text-muted">
            Inside: {STOPS.join(' · ')}
          </Reveal>
          <Reveal as="div" delay={3}>
            <Link
              to="/home"
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-7.5 py-4 text-[13px] font-semibold tracking-[0.1em] text-cream uppercase transition-all duration-[350ms] ease-editorial hover:-translate-y-1 hover:bg-ink-soft"
            >
              Enter the site <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        {/* Empty spacer matching the wordmark's line height, so the
            justify-between split keeps the CTA block vertically centered
            rather than pinned to the bottom on tall viewports. */}
        <span aria-hidden="true" className="hidden lg:block" />
      </div>

      <div className="relative order-first h-[42vh] overflow-hidden bg-cream-deep sm:h-[48vh] lg:order-none lg:h-auto lg:w-1/2 lg:border-l lg:border-line">
        {/* Static fallback, always rendered: a giant ghost initial. On
            capable desktops a small explorable toy fades in over it — a
            figure you walk from stop to stop by clicking or tapping the
            ground, one per project — but everywhere else this is the whole
            picture, not an empty panel waiting for something that never
            arrives. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="font-serif text-[46vw] leading-none text-ink/[0.06] select-none sm:text-[32vw] lg:text-[20vw]">
            {site.wordmark.charAt(0)}
          </span>
        </div>
        <ExploreSceneMount projects={projects} />
      </div>
    </div>
  )
}
