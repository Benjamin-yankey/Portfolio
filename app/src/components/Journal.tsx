import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { journalEntries, type JournalEntry } from '../data/journal'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

const ROW_CLASS =
  'grid items-start gap-[clamp(20px,4vw,48px)] border-b border-line py-[clamp(28px,3.6vw,40px)] transition-opacity duration-300 ease-editorial hover:opacity-65 max-[860px]:grid-cols-1 max-[860px]:gap-1.5'

/** Articles published on the site open in place; the rest link out to their source. */
function EntryLink({ entry, children }: Readonly<{ entry: JournalEntry; children: ReactNode }>) {
  const className = [ROW_CLASS, entry.image ? 'grid-cols-[72px_120px_1fr]' : 'grid-cols-[120px_1fr]'].join(' ')
  return entry.slug ? (
    <Link to={`/journal/${entry.slug}`} className={className}>
      {children}
    </Link>
  ) : (
    <a href={entry.href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

export function Journal() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Journal" index="04 — Journal" />

        <Reveal as="p" className="mb-8 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft">
          Write-ups from the projects: architecture decisions, runbooks, audits and incident
          reports. Also available as an{' '}
          <a href={`${import.meta.env.BASE_URL}journal/rss.xml`} className="text-ink underline underline-offset-4">
            RSS feed
          </a>
          .
        </Reveal>

        <Reveal as="div" className="border-t border-line">
          {journalEntries.length === 0 ? (
            <p className="py-[clamp(28px,3.6vw,40px)] text-[0.96rem] text-muted">
              No entries yet — check back later.
            </p>
          ) : (
            journalEntries.map((entry) => (
              <EntryLink key={entry.title} entry={entry}>
                {entry.image && (
                  <img
                    src={entry.image}
                    alt=""
                    className="aspect-square w-full rounded-lg object-cover max-[860px]:hidden"
                  />
                )}
                <span className="pt-1 text-[0.85rem] text-muted">{entry.date}</span>
                <div>
                  <h3 className="mb-2 font-serif text-[clamp(1.3rem,2.6vw,1.9rem)]">
                    {entry.title}
                  </h3>
                  <p className="max-w-[60ch] text-[0.96rem] text-muted">{entry.excerpt}</p>
                  <p className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-ink-soft uppercase">
                    {entry.slug ? (
                      <>
                        Read article <span aria-hidden="true">→</span>
                      </>
                    ) : (
                      <>
                        Read on GitHub <span aria-hidden="true">↗</span>
                      </>
                    )}
                  </p>
                </div>
              </EntryLink>
            ))
          )}
        </Reveal>
      </div>
    </section>
  )
}
