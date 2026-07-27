import { certifications, skillCategories } from '../data/skills'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { Tilt3D } from './Tilt3D'

export function Skills() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Skills & tools" index="02 — Skills" />

        <Reveal
          as="div"
          depth
          className="grid grid-cols-3 gap-x-12 gap-y-14 max-[860px]:grid-cols-2 max-[600px]:grid-cols-1"
        >
          {skillCategories.map((category) => (
            <Tilt3D
              key={category.title}
              maxTilt={9}
              lift={30}
              perspective={800}
              className="group"
              planeClassName="relative"
            >
              {/* The card surface is a separate inset-negative layer rather
                  than padding on the plane: padding would push the text
                  inward and break the column's alignment with the
                  certifications block below, which shares the same grid
                  edge. This way the hover surface bleeds outward while the
                  type stays flush. It sits at Z 0, behind the raised
                  content, so DOM order alone keeps the stacking right. */}
              <span
                aria-hidden="true"
                className="absolute -inset-x-5 -inset-y-4 rounded-2xl bg-white/0 opacity-0 shadow-[0_24px_60px_rgba(26,26,26,0.13)] transition-all duration-500 ease-editorial group-hover:bg-white/30 group-hover:opacity-100"
              />

              <h3 className="layer-3d mb-4.5 border-b border-line pb-3.5 font-serif text-[1.3rem] font-normal group-hover:[--layer-z:34px]">
                {category.title}
              </h3>
              <ul className="layer-3d group-hover:[--layer-z:16px]">
                {category.items.map((item) => (
                  <li
                    key={item}
                    className="border-b border-line-soft py-2 text-[0.98rem] text-ink-soft last:border-b-0"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Tilt3D>
          ))}
        </Reveal>

        <Reveal
          as="div"
          depth
          className="mt-[clamp(56px,7vw,88px)] border-t border-line pt-[clamp(32px,4vw,48px)]"
        >
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
