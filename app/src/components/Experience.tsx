import { experience } from '../data/experience'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function Experience() {
  return (
    <section id="experience" className="section border-b border-line-soft">
      <div className="container-page">
        <SectionHeading title="Experience" index="03 — Experience" />

        <Reveal as="div" className="border-t border-line">
          {experience.map((item) => (
            <div
              key={item.role + item.period}
              className="grid grid-cols-[220px_1fr] gap-[clamp(20px,4vw,56px)] border-b border-line py-[clamp(30px,4vw,48px)] max-[860px]:grid-cols-1"
            >
              <span className="pt-1 text-[0.85rem] tracking-[0.02em] text-muted">
                {item.period}
              </span>
              <div>
                <h3 className="mb-1 font-serif text-[clamp(1.3rem,2.4vw,1.7rem)]">{item.role}</h3>
                <p className="mb-4 text-[0.95rem] text-muted">{item.company}</p>
                <ul>
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="relative mb-2 pl-4.5 text-[0.96rem] leading-[1.65] text-ink-soft before:absolute before:left-0 before:text-muted-faint before:content-['—']"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
