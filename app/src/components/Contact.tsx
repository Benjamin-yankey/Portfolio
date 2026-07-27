import { site } from '../data/site'
import { Reveal } from './Reveal'

export function Contact() {
  return (
    <section className="section text-center">
      <div className="container-page">
        <p className="eyebrow mb-0 text-center">05 — Contact</p>
        <Reveal as="h2" className="mt-6 mb-6 font-serif text-[clamp(3rem,9vw,6.4rem)] leading-none">
          Let&apos;s talk.
        </Reveal>
        <Reveal
          as="p"
          className="mx-auto mb-10 max-w-[520px] text-[1.02rem] leading-[1.7] text-ink-soft"
        >
          {site.contactSub}
        </Reveal>
        <Reveal
          as="a"
          href={`mailto:${site.email}`}
          className="mb-10 inline-block border-b border-ink pb-1.5 font-serif text-[clamp(1.3rem,3vw,1.9rem)] transition-opacity duration-300 ease-editorial hover:opacity-60"
        >
          {site.email}
        </Reveal>
        <Reveal
          as="div"
          className="mb-12 flex flex-wrap items-center justify-center gap-[clamp(20px,4vw,36px)]"
        >
          <a
            href={site.github}
            className="border-b border-transparent pb-1 text-[13px] font-semibold tracking-[0.08em] text-ink-soft uppercase transition-all duration-300 ease-editorial hover:border-ink hover:text-ink"
          >
            GitHub
          </a>
          <a
            href={site.linkedin}
            className="border-b border-transparent pb-1 text-[13px] font-semibold tracking-[0.08em] text-ink-soft uppercase transition-all duration-300 ease-editorial hover:border-ink hover:text-ink"
          >
            LinkedIn
          </a>
        </Reveal>
        <Reveal
          as="a"
          href={site.resumeHref}
          className="inline-flex items-center gap-2.5 rounded-full bg-ink px-7.5 py-4 text-[13px] font-semibold tracking-[0.1em] text-cream uppercase transition-all duration-[350ms] ease-editorial hover:-translate-y-1 hover:bg-ink-soft"
        >
          Download résumé <span aria-hidden="true">↓</span>
        </Reveal>
      </div>
    </section>
  )
}
