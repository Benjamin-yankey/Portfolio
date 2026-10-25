import { Link } from 'react-router-dom'
import { featuredProjects } from '../../data/projects'
import { projectHref } from '../../lib/routes'
import { Reveal } from '../Reveal'
import { Tilt3D } from '../Tilt3D'

/** Home's preview of the work: the featured projects as cards, each opening its page. */
export function FeaturedWork() {
  if (featuredProjects.length === 0) return null

  return (
    <section className="section">
      <div className="container-page">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-6 sm:mb-12">
          <h2 className="font-serif text-[clamp(2.4rem,5.4vw,4.4rem)] leading-none tracking-[-0.01em]">
            Featured work
          </h2>
          <Link
            to="/projects"
            className="border-b border-transparent pb-0.5 text-[13px] font-semibold tracking-[0.06em] text-ink-soft uppercase transition-all duration-300 ease-editorial hover:border-ink hover:text-ink"
          >
            All projects →
          </Link>
        </Reveal>

        <Reveal
          as="ul"
          depth
          className="grid grid-cols-3 gap-[clamp(20px,3vw,32px)] max-[960px]:grid-cols-2 max-[640px]:grid-cols-1"
        >
          {featuredProjects.map((project) => (
            <li key={project.slug}>
              <Tilt3D
                as={Link}
                to={projectHref(project.slug)}
                maxTilt={5}
                lift={16}
                className="group block h-full"
                planeClassName="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/40 transition-shadow duration-500 ease-editorial group-hover:shadow-[0_24px_60px_rgba(26,26,26,0.13)]"
              >
                <span className="block aspect-[16/10] overflow-hidden border-b border-line bg-cream-deep">
                  {project.image && (
                    <img
                      src={project.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
                    />
                  )}
                </span>
                <span className="flex flex-1 flex-col p-[clamp(18px,2.4vw,26px)]">
                  <span className="eyebrow mb-3">
                    {[project.num, project.categories.join(' · ')].filter(Boolean).join(' — ')}
                  </span>
                  <span className="mb-2 font-serif text-[clamp(1.3rem,2vw,1.55rem)] leading-[1.2]">
                    {project.title}
                  </span>
                  <span className="mb-5 text-[0.92rem] leading-[1.6] text-muted">{project.summary}</span>
                  <span className="mt-auto flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </span>
                </span>
              </Tilt3D>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
