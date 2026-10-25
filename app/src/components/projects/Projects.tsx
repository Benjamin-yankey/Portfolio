import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { projectCategories, projects } from '../../data/projects'
import { projectsUsingSkill } from '../../data/skills'
import { FilterChips } from '../FilterChips'
import { Reveal } from '../Reveal'
import { SectionHeading } from '../SectionHeading'
import { ProjectRow } from './ProjectRow'

const ALL = 'All'

/**
 * Selected work, filterable by category and by skill. Both filters live in
 * the URL (?category=…&skill=…), so the Skills page and search can link
 * straight to a filtered view and the filtered view can be shared.
 */
export function Projects() {
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? ALL
  const skill = params.get('skill')

  const bySkill = useMemo(() => (skill ? projectsUsingSkill(skill) : projects), [skill])
  const visible =
    category === ALL ? bySkill : bySkill.filter((project) => project.categories.includes(category))

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const options = [ALL, ...projectCategories].map((value) => ({
    value,
    label: value,
    count:
      value === ALL ? bySkill.length : bySkill.filter((project) => project.categories.includes(value)).length,
  }))

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Selected work" index="01 — Projects" />

        <Reveal as="p" className="mb-8 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft">
          Full-stack products and the infrastructure that runs them. Open any project for the
          problem, the approach, the full stack and the code.
        </Reveal>

        <Reveal as="div" className="mb-10 flex flex-wrap items-center gap-x-5 gap-y-3">
          <FilterChips
            label="Filter projects by category"
            options={options}
            active={category}
            onChange={(value) => setParam('category', value === ALL ? null : value)}
          />
          {skill && (
            <button
              type="button"
              onClick={() => setParam('skill', null)}
              className="inline-flex items-center gap-2 rounded-full border border-ink px-3.5 py-[5px] text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors duration-300 ease-editorial hover:bg-ink hover:text-cream"
            >
              Using {skill}
              <span aria-hidden="true">×</span>
              <span className="sr-only">— clear skill filter</span>
            </button>
          )}
        </Reveal>

        {visible.length === 0 ? (
          <p className="border-t border-line py-[clamp(28px,3.6vw,40px)] text-[0.96rem] text-muted">
            No projects match these filters.{' '}
            <Link to="/projects" replace className="text-ink underline underline-offset-4">
              Show all projects
            </Link>
          </p>
        ) : (
          <Reveal as="ul" depth className="border-t border-line">
            {visible.map((project) => (
              <ProjectRow key={project.slug} project={project} />
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}
