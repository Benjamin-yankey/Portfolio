import { experience } from '../data/experience'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { Tilt3D } from './Tilt3D'

export function Experience() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Experience" index="03 — Experience" />

        <Reveal as="div" depth className="border-t border-line">
          {experience.map((item) => (
            // Full-bleed rows separated by hairlines, so these get the
            // gentlest tilt on the page — anything stronger visibly bows the
            // shared borders and the timeline stops reading as a single
            // continuous column.
            <Tilt3D
              key={item.role + item.period}
              maxTilt={2}
              lift={18}
              perspective={2000}
              className="group border-b border-line"
              planeClassName="grid grid-cols-[220px_1fr] gap-[clamp(20px,4vw,56px)] py-[clamp(30px,4vw,48px)] max-[860px]:grid-cols-1"
            >
              <span className="layer-3d pt-1 text-[0.85rem] tracking-[0.02em] text-muted group-hover:[--layer-z:10px]">
                {item.period}
              </span>
              <div className="layer-3d group-hover:[--layer-z:28px]">
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
            </Tilt3D>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
