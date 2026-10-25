import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { experience } from '../data/experience'
import { projects } from '../data/projects'
import { site } from '../data/site'
import { certifications, skillCategories } from '../data/skills'
import { projectHref } from '../lib/routes'

/** How many projects the résumé lists. */
const RESUME_PROJECTS = 6

const HEADING = 'mb-3 border-b border-line pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase print:mb-2'

/**
 * A printable résumé built from the same content as the rest of the site,
 * so it can't drift out of date. "Print / Save as PDF" uses the browser's
 * print dialog; the print styles in index.css drop the site chrome and force
 * the light theme. Deliberately no scroll reveals: content that hasn't
 * animated in would print blank.
 */
export function Resume() {
  useEffect(() => {
    document.title = `Résumé — ${site.name}`
  }, [])

  const contacts = [
    { label: site.email, href: `mailto:${site.email}` },
    { label: site.github.replace(/^https?:\/\//, ''), href: site.github },
    { label: site.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: site.linkedin },
  ]

  return (
    <section className="section print:p-0">
      <div className="container-page print:max-w-none print:px-0">
        <div className="mb-10 flex flex-wrap items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 text-[12px] font-semibold tracking-[0.1em] text-cream uppercase transition-colors duration-300 ease-editorial hover:bg-ink-soft"
          >
            Print / Save as PDF
          </button>
          {site.resumeHref && (
            <a
              href={site.resumeHref}
              download
              className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300 ease-editorial hover:bg-ink hover:text-cream"
            >
              Download the PDF version
            </a>
          )}
        </div>

        <article className="resume-sheet max-w-[860px] rounded-2xl border border-line bg-surface/40 p-[clamp(24px,4vw,48px)] print:max-w-none print:rounded-none print:border-0 print:bg-transparent print:p-0">
          <header className="mb-8 print:mb-5">
            <h1 className="font-serif text-[clamp(2.2rem,5vw,3.2rem)] leading-[1.05] print:text-[24pt]">{site.name}</h1>
            <p className="mt-2 text-[1.05rem] text-ink-soft">{site.role}</p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.88rem] text-muted">
              {site.location && <span>{site.location}</span>}
              {contacts.map((contact) => (
                <a key={contact.href} href={contact.href} className="underline-offset-4 hover:text-ink hover:underline">
                  {contact.label}
                </a>
              ))}
            </p>
            <p className="mt-5 text-[0.95rem] leading-[1.65] text-ink-soft">{site.bio}</p>
          </header>

          <section className="mb-8 print:mb-5">
            <h2 className={HEADING}>Experience & education</h2>
            {experience.map((item) => (
              <div key={item.role + item.period} className="mb-5 break-inside-avoid last:mb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="font-serif text-[1.15rem]">{item.role}</h3>
                  <span className="text-[0.82rem] text-muted">{item.period}</span>
                </div>
                <p className="mb-1.5 text-[0.88rem] text-muted">{item.company}</p>
                <ul className="list-disc pl-5 text-[0.9rem] leading-[1.55] text-ink-soft marker:text-muted">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="mb-1">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="mb-8 print:mb-5">
            <h2 className={HEADING}>Selected projects</h2>
            <ul>
              {projects.slice(0, RESUME_PROJECTS).map((project) => (
                <li key={project.slug} className="mb-3 break-inside-avoid text-[0.9rem] leading-[1.55]">
                  <Link to={projectHref(project.slug)} className="font-semibold text-ink underline-offset-4 hover:underline">
                    {project.title}
                  </Link>
                  <span className="text-ink-soft"> — {project.summary} </span>
                  <span className="text-muted">({project.tags.join(', ')})</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-8 break-inside-avoid print:mb-5">
            <h2 className={HEADING}>Skills</h2>
            <dl className="grid grid-cols-[minmax(0,170px)_1fr] gap-x-4 gap-y-1.5 text-[0.9rem] max-[560px]:grid-cols-1">
              {skillCategories.map((category) => (
                <div key={category.title} className="contents">
                  <dt className="font-semibold text-ink">{category.title}</dt>
                  <dd className="text-ink-soft max-[560px]:mb-2">{category.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="break-inside-avoid">
            <h2 className={HEADING}>Certifications</h2>
            <ul className="text-[0.9rem] leading-[1.6]">
              {certifications.map((cert) => (
                <li key={cert.name}>
                  <span className="text-ink">{cert.name}</span>
                  <span className="text-muted"> — {[cert.issuer, cert.year].filter(Boolean).join(', ')}</span>
                </li>
              ))}
            </ul>
          </section>
        </article>
      </div>
    </section>
  )
}
