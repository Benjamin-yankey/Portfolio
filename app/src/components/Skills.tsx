import { certifications, skillCategories } from '../data/skills'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function Skills() {
  return (
    <section id="skills" className="section border-b border-line-soft">
      <div className="container-page">
        <SectionHeading title="Skills & tools" index="02 — Skills" />

        <Reveal
          as="div"
          className="grid grid-cols-3 gap-x-12 gap-y-14 max-[860px]:grid-cols-2 max-[600px]:grid-cols-1"
        >
          {skillCategories.map((category) => (
            <div key={category.title}>
              <h3 className="mb-4.5 border-b border-line pb-3.5 font-serif text-[1.3rem] font-normal">
                {category.title}
              </h3>
              <ul>
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="border-b border-line-soft py-2 text-[0.98rem] text-ink-soft last:border-b-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <Reveal as="div" className="mt-[clamp(56px,7vw,88px)] border-t border-line pt-[clamp(32px,4vw,48px)]">
          <p className="eyebrow mb-5.5">Certifications</p>
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line-soft py-4 last:border-b-0 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-1"
            >
              <span className="font-serif text-[1.15rem]">{cert.name}</span>
              <span className="text-[0.85rem] text-muted">
                {cert.issuer} · {cert.year}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
