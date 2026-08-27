import { type SubmitEvent, useState } from 'react'
import { site } from '../data/site'
import { projects } from '../data/projects'
import { certifications, skillCategories } from '../data/skills'
import { githubStats } from '../data/githubStats'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const CONTACT_GRID = [
  { label: 'Email', linkText: site.email, href: `mailto:${site.email}` },
  { label: 'GitHub', linkText: 'View profile', href: site.github },
  { label: 'LinkedIn', linkText: 'View profile', href: site.linkedin },
  ...(site.resumeHref ? [{ label: 'Résumé', linkText: 'Download PDF', href: site.resumeHref, download: true }] : []),
]

const STATS = [
  { value: `${projects.length}`, label: 'Projects shipped' },
  { value: `${certifications.length}`, label: 'Certifications' },
  { value: `${githubStats.repositories}`, label: 'GitHub repos' },
]

/**
 * There's no backend behind this site (static Vite build, no API routes),
 * so "sending" the form can't mean posting to a server — it means handing
 * the filled-in message to the visitor's own mail client via `mailto:`,
 * which is the one submission path that actually delivers without one.
 */
function buildMailtoHref(name: string, email: string, subject: string, message: string) {
  const body = `${message}\n\n— ${name || '(no name given)'} (${email || 'no email given'})`
  const params = new URLSearchParams({ subject: subject || 'Project inquiry', body })
  return `mailto:${site.email}?${params.toString()}`
}

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    window.location.href = buildMailtoHref(name, email, subject, message)
  }

  return (
    <>
      {/* Full-bleed split hero — sits outside `container-page` deliberately,
          same pattern as GithubExploreMount, so the two halves reach the
          viewport edges. Starts at the true top of the page; the fixed
          TopBar (bg-cream, z-60) overlays its first ~120px, so the eyebrow
          and headline carry enough top padding to clear it rather than
          sitting behind it. */}
      <section className="grid grid-cols-2 max-[760px]:grid-cols-1">
        <Reveal
          as="div"
          depth
          className="flex flex-col justify-center gap-6 bg-ink px-[clamp(24px,6vw,72px)] pt-[140px] pb-[clamp(56px,8vw,96px)] text-cream max-[760px]:pt-[120px]"
        >
          <span className="text-[11px] font-semibold tracking-[0.18em] text-cream/60 uppercase">
            Contact
          </span>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[1.08]">
            Let's build something great
          </h1>
        </Reveal>
        <div className="relative min-h-[360px] max-[760px]:min-h-[280px]">
          <img
            src={site.contactImage || site.portrait}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />
        </div>
      </section>

      <section className="section">
      <div className="container-page">
        <Reveal
          as="p"
          className="mb-6 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft"
        >
          {site.contactSub}
        </Reveal>

        {(site.availabilityStatus || site.location) && (
          <Reveal as="div" className="mb-10 flex flex-wrap items-center gap-3">
            {site.availabilityStatus && (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/40 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-ink-soft uppercase">
                <span className="h-2 w-2 shrink-0 rounded-full bg-ink" aria-hidden="true" />
                {site.availabilityStatus}
              </span>
            )}
            {site.location && (
              <span className="text-[0.85rem] text-muted">{site.location}</span>
            )}
          </Reveal>
        )}

        <Reveal
          as="div"
          depth
          className="mb-[clamp(40px,5vw,64px)] grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line-soft"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-cream px-4 py-6 text-center">
              <p className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] leading-none">{stat.value}</p>
              <p className="mt-2 text-[11px] tracking-[0.06em] text-muted uppercase">{stat.label}</p>
            </div>
          ))}
        </Reveal>

        {skillCategories.length > 0 && (
          <Reveal as="div" className="mb-[clamp(40px,5vw,64px)]">
            <span className="mb-3 block text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              Topics I can help with
            </span>
            <div className="flex flex-wrap gap-2">
              {skillCategories.map((category) => (
                <span key={category.title} className="tag-pill">
                  {category.title}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        <SectionHeading title="Contact us" index="06 — Contact" />

        {site.engagementTypes && site.engagementTypes.length > 0 && (
          <Reveal as="div" className="mb-10">
            <span className="mb-2 block text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              Open to
            </span>
            <div className="flex flex-wrap gap-2">
              {site.engagementTypes.map((type) => (
                <span key={type} className="tag-pill">
                  {type}
                </span>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal
          as="div"
          depth
          className="mb-[clamp(48px,6vw,80px)] grid grid-cols-4 gap-x-[clamp(24px,4vw,48px)] gap-y-10 max-[760px]:grid-cols-2 max-[420px]:grid-cols-1"
        >
          {CONTACT_GRID.map(({ label, linkText, href, download }) => (
            <div key={label} className="min-w-0">
              <h3 className="mb-3 font-serif text-[1.3rem]">{label}</h3>
              <a
                href={href}
                download={download}
                title={linkText}
                className="inline-flex max-w-full items-center overflow-hidden rounded-full border border-line px-5 py-2.5 text-[0.85rem] font-semibold tracking-[0.02em] text-ink-soft transition-all duration-300 ease-editorial hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-cream"
              >
                <span className="truncate">{linkText}</span>
              </a>
            </div>
          ))}
        </Reveal>

        <div className="max-w-[720px]">
          <Reveal
            as="form"
            depth
            onSubmit={handleSubmit}
            className="rounded-2xl border border-line bg-white/40 p-[clamp(20px,3vw,32px)]"
          >
            <div className="mb-5 grid grid-cols-2 gap-4 max-[520px]:grid-cols-1">
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  Your name
                </span>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-line bg-cream px-4 py-3 text-[0.95rem] outline-none transition-colors duration-300 ease-editorial focus:border-ink"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="jane@company.com"
                  className="w-full rounded-lg border border-line bg-cream px-4 py-3 text-[0.95rem] outline-none transition-colors duration-300 ease-editorial focus:border-ink"
                />
              </label>
            </div>

            <label className="mb-5 block">
              <span className="mb-2 block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                Subject
              </span>
              <input
                type="text"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="Project inquiry"
                className="w-full rounded-lg border border-line bg-cream px-4 py-3 text-[0.95rem] outline-none transition-colors duration-300 ease-editorial focus:border-ink"
              />
            </label>

            <label className="mb-6 block">
              <span className="mb-2 block text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                Message
              </span>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell me about your project…"
                className="w-full resize-none rounded-lg border border-line bg-cream px-4 py-3 text-[0.95rem] outline-none transition-colors duration-300 ease-editorial focus:border-ink"
              />
            </label>

            <button
              type="submit"
              className="inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[13px] font-semibold tracking-[0.1em] text-cream uppercase transition-all duration-[350ms] ease-editorial hover:-translate-y-1 hover:bg-ink-soft"
            >
              Send message <span aria-hidden="true">→</span>
            </button>
            <p className="mt-3 text-[0.8rem] text-muted">
              Opens your email client with this message pre-filled.
            </p>
          </Reveal>
        </div>
      </div>
      </section>
    </>
  )
}
