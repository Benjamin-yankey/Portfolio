import { site } from '../data/site'
import { HeroBadge } from './HeroBadge'

export function Hero() {
  return (
    <section
      id="home"
      className="section flex min-h-screen items-center border-b border-line-soft pt-[clamp(120px,16vh,180px)]"
    >
      <div className="container-page">
        {/* The hero is visible immediately on load (not scroll-revealed),
            matching the source, which marks it `in-view` from the start
            since it's already on screen at first paint. */}
        <div className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-[680px]">
            <p className="eyebrow mb-6">{site.eyebrow}</p>
            <h1 className="mb-6 font-serif text-[clamp(3.4rem,11vw,8.6rem)] leading-[0.96] tracking-[-0.015em]">
              Benjamin
              <br />
              Yankey
            </h1>
            <p className="mb-2 text-[clamp(1rem,1.6vw,1.2rem)] font-medium tracking-[0.02em] text-ink-soft">
              {site.role}
            </p>
            <p className="mb-9 font-serif text-[clamp(1.3rem,2.4vw,1.8rem)] text-muted italic">
              {site.tagline}
            </p>
            <p className="mb-10 max-w-[620px] text-[1.02rem] leading-[1.75] text-ink-soft">
              {site.bio}
            </p>
            <a
              href="#projects"
              className="group inline-flex items-center gap-2.5 border-b border-ink pb-1.5 text-[13px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ease-editorial hover:gap-4 hover:opacity-70"
            >
              View the work{' '}
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-editorial group-hover:translate-y-[3px]"
              >
                ↓
              </span>
            </a>
          </div>
          <HeroBadge />
        </div>
      </div>
    </section>
  )
}
