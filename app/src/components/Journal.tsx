import { journalEntries } from '../data/journal'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function Journal() {
  return (
    <section id="journal" className="section border-b border-line-soft">
      <div className="container-page">
        <SectionHeading title="Journal" index="04 — Journal" />

        <Reveal as="div" className="border-t border-line">
          {journalEntries.map((entry) => (
            <a
              key={entry.title}
              href={entry.href}
              className="grid grid-cols-[120px_1fr] gap-[clamp(20px,4vw,48px)] border-b border-line py-[clamp(28px,3.6vw,40px)] transition-opacity duration-300 ease-editorial hover:opacity-65 max-[860px]:grid-cols-1 max-[860px]:gap-1.5"
            >
              <span className="pt-1 text-[0.85rem] text-muted">{entry.date}</span>
              <div>
                <h3 className="mb-2 font-serif text-[clamp(1.3rem,2.6vw,1.9rem)]">
                  {entry.title}
                </h3>
                <p className="max-w-[60ch] text-[0.96rem] text-muted">{entry.excerpt}</p>
              </div>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
