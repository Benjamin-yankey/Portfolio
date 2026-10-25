import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navItems } from '../data/nav'
import { site } from '../data/site'
import { Reveal } from './Reveal'

/** Any address the router doesn't know — a mistyped link, an old URL. */
export function NotFound() {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = `Page not found — ${site.wordmark}`
  }, [])

  return (
    <section className="section">
      <div className="container-page">
        <Reveal as="p" className="eyebrow mb-5">
          404 — Not found
        </Reveal>
        <Reveal
          as="h1"
          delay={1}
          className="mb-6 font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.05] tracking-[-0.01em]"
        >
          This page doesn't exist.
        </Reveal>
        <Reveal as="p" delay={2} className="mb-10 max-w-[52ch] text-[1.02rem] leading-[1.7] text-ink-soft">
          Nothing lives at <code className="rounded bg-surface/60 px-1.5 py-0.5 text-[0.92em]">{pathname}</code>.
          It may have moved — try one of these instead, or press <kbd className="font-sans">/</kbd> to search.
        </Reveal>
        <Reveal as="ul" delay={3} className="flex flex-wrap gap-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="inline-flex rounded-full border border-ink px-5 py-2.5 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300 ease-editorial hover:bg-ink hover:text-cream"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
