import { type SubmitEvent, useState } from 'react'
import { site } from '../data/site'
import { EmailIcon, GitHubIcon, LinkedInIcon } from './icons/SocialIcons'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const INFO_CARDS = [
  { label: 'Email', value: site.email, href: `mailto:${site.email}`, Icon: EmailIcon },
  { label: 'GitHub', value: 'Benjamin-yankey', href: site.github, Icon: GitHubIcon },
  { label: 'LinkedIn', value: 'benjamin-yankey', href: site.linkedin, Icon: LinkedInIcon },
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
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Let's build something great" index="06 — Contact" />

        <Reveal
          as="p"
          className="mb-[clamp(40px,5vw,64px)] max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft"
        >
          {site.contactSub}
        </Reveal>

        <div className="grid grid-cols-[1fr_1.3fr] gap-[clamp(28px,4vw,56px)] max-[860px]:grid-cols-1">
          <Reveal as="div" depth className="flex flex-col gap-4">
            {INFO_CARDS.map(({ label, value, href, Icon }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-white/40 p-5 transition-colors duration-300 ease-editorial hover:bg-white/70"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-cream transition-transform duration-300 ease-editorial group-hover:-translate-y-0.5">
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                    {label}
                  </span>
                  <span className="block font-serif text-[1.05rem]">{value}</span>
                </span>
              </a>
            ))}

            {site.resumeHref && (
              <a
                href={site.resumeHref}
                download
                className="mt-2 inline-flex w-fit items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-[13px] font-semibold tracking-[0.1em] text-cream uppercase transition-all duration-[350ms] ease-editorial hover:-translate-y-1 hover:bg-ink-soft"
              >
                Download résumé <span aria-hidden="true">↓</span>
              </a>
            )}
          </Reveal>

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
  )
}
