import { Link } from 'react-router-dom'
import { projects } from '../data/projects'
import { certifications, projectsUsingSkill, skillCategories, skillUsage } from '../data/skills'
import { skillHref } from '../lib/routes'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { Tilt3D } from './Tilt3D'

/** How many tools the "most used" ranking shows. */
const TOP_COUNT = 8
const topTools = skillUsage.filter((usage) => usage.projects.length > 0).slice(0, TOP_COUNT)
const maxUses = topTools[0]?.projects.length ?? 1

function projectCountLabel(count: number) {
  return `Used in ${count} ${count === 1 ? 'project' : 'projects'}`
}

export function Skills() {
  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Skills & tools" index="02 — Skills" />

        <Reveal as="p" className="mb-[clamp(40px,5vw,56px)] max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft">
          Grouped by the job they do. The number beside a tool is how many of the projects on
          this site use it — click it to see them.
        </Reveal>

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
                className="absolute -inset-x-5 -inset-y-4 rounded-2xl bg-surface/0 opacity-0 shadow-[0_24px_60px_rgba(26,26,26,0.13)] transition-all duration-500 ease-editorial group-hover:bg-surface/30 group-hover:opacity-100"
              />

              <h3 className="layer-3d mb-4.5 border-b border-line pb-3.5 font-serif text-[1.3rem] font-normal group-hover:[--layer-z:34px]">
                {category.title}
              </h3>
              <ul className="layer-3d group-hover:[--layer-z:16px]">
                {category.items.map((item) => {
                  const count = projectsUsingSkill(item).length
                  return (
                    <li
                      key={item}
                      className="border-b border-line-soft text-[0.98rem] text-ink-soft last:border-b-0"
                    >
                      {count > 0 ? (
                        <Link
                          to={skillHref(item)}
                          title={projectCountLabel(count)}
                          className="group/skill flex items-baseline justify-between gap-3 py-2 transition-colors duration-300 ease-editorial hover:text-ink"
                        >
                          <span className="underline-offset-4 group-hover/skill:underline">{item}</span>
                          <span className="text-[0.78rem] text-muted">
                            {count}
                            <span className="sr-only"> {count === 1 ? 'project' : 'projects'}</span>
                          </span>
                        </Link>
                      ) : (
                        <span className="block py-2">{item}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Tilt3D>
          ))}
        </Reveal>

        {topTools.length > 0 && (
          <Reveal
            as="section"
            className="mt-[clamp(56px,7vw,88px)] border-t border-line pt-[clamp(32px,4vw,48px)]"
          >
            <h3 className="eyebrow mb-2">Most used across my projects</h3>
            <p className="mb-7 text-[0.9rem] text-muted">
              Out of {projects.length} projects. Hover for which ones, click to open them.
            </p>
            <ol>
              {topTools.map((usage) => {
                const count = usage.projects.length
                return (
                  <li key={usage.skill}>
                    <Link
                      to={skillHref(usage.skill)}
                      className="group relative grid grid-cols-[minmax(0,210px)_1fr] items-center gap-5 py-2.5 max-[600px]:grid-cols-[minmax(0,130px)_1fr] max-[600px]:gap-3"
                    >
                      <span className="truncate text-[0.95rem] text-ink-soft transition-colors duration-300 ease-editorial group-hover:text-ink">
                        {usage.skill}
                      </span>
                      <span className="flex items-center gap-3">
                        {/* Thin bar, square at the baseline and rounded at the
                            data end; the count sits at the tip in text color.
                            The 2.5rem reserves room for that count. */}
                        <span
                          className="h-2 shrink-0 rounded-r-[4px] bg-ink transition-opacity duration-300 ease-editorial group-hover:opacity-70"
                          style={{ width: `calc((100% - 2.5rem) * ${count / maxUses})` }}
                        />
                        <span className="text-[0.85rem] text-muted">
                          {count}
                          <span className="sr-only"> — {usage.projects.map((p) => p.title).join(', ')}</span>
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-[calc(100%-6px)] left-[230px] z-10 max-w-[min(420px,70vw)] -translate-y-1 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-[0.8rem] leading-[1.5] text-ink-soft opacity-0 shadow-[0_12px_32px_rgba(26,26,26,0.14)] transition-all duration-200 ease-editorial group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 max-[600px]:left-0"
                      >
                        {usage.projects.map((p) => p.title).join(' · ')}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </Reveal>
        )}

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
                {[cert.issuer, cert.year].filter(Boolean).join(' · ')}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
