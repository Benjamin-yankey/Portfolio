import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findProject, galleryForProject, projects } from '../../data/projects'
import { site } from '../../data/site'
import { skillForTool } from '../../data/skills'
import { useLightbox } from '../../hooks/useLightbox'
import { projectHref, skillHref } from '../../lib/routes'
import { Reveal } from '../Reveal'
import { GalleryTile } from '../gallery/GalleryTile'
import { Lightbox } from '../gallery/Lightbox'

/** A project's own page at /projects/:slug — the full write-up the list links to. */
export function ProjectPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const media = useMemo(() => (project ? galleryForProject(project) : []), [project])
  const lightbox = useLightbox(media.length)

  useEffect(() => {
    if (project) document.title = `${project.title} — ${site.name}`
  }, [project])

  if (!project) return <Navigate to="/projects" replace />

  const index = projects.indexOf(project)
  const previous = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]

  const sections = [
    { label: 'Problem', text: project.problem },
    { label: 'Solution', text: project.solution },
    { label: 'Role', text: project.role },
  ]

  return (
    <article className="section">
      <div className="container-page">
        <Reveal as="div" className="mb-10">
          <Link
            to="/projects"
            className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase transition-colors duration-300 ease-editorial hover:text-ink"
          >
            <span aria-hidden="true">←</span> All projects
          </Link>
        </Reveal>

        <Reveal as="p" className="eyebrow mb-5">
          {[project.num, project.categories.join(' · ')].filter(Boolean).join(' — ')}
        </Reveal>
        <Reveal
          as="h1"
          delay={1}
          className="mb-6 max-w-[20ch] font-serif text-[clamp(2.5rem,6vw,4.8rem)] leading-[1.03] tracking-[-0.01em]"
        >
          {project.title}
        </Reveal>
        <Reveal
          as="p"
          delay={2}
          className="mb-8 max-w-[52ch] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.6] text-ink-soft"
        >
          {project.summary}
        </Reveal>

        {project.links && project.links.length > 0 && (
          <Reveal as="div" delay={3} className="flex flex-wrap gap-3">
            {project.links.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  'group inline-flex items-center gap-2 rounded-full border border-ink px-5.5 py-3 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300 ease-editorial',
                  // The first link is the primary action; the rest are outlined.
                  i === 0 ? 'bg-ink text-cream hover:bg-ink-soft' : 'hover:bg-ink hover:text-cream',
                ].join(' ')}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 ease-editorial group-hover:translate-x-0.5"
                >
                  ↗
                </span>
              </a>
            ))}
          </Reveal>
        )}

        {(project.video || project.image) && (
          <Reveal
            as="div"
            depth
            className="mt-[clamp(40px,6vw,72px)] overflow-hidden rounded-2xl border border-line"
          >
            {project.video ? (
              <video
                src={project.video}
                poster={project.image}
                controls
                playsInline
                className="aspect-video w-full bg-panel object-contain"
              />
            ) : (
              // Natural aspect ratio rather than a fixed crop: most of these
              // are architecture diagrams, and cropping cuts off labels.
              <img src={project.image} alt={`${project.title} — overview`} className="h-auto w-full" />
            )}
          </Reveal>
        )}

        <div className="mt-[clamp(56px,8vw,96px)] grid grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-[clamp(32px,6vw,88px)] max-[860px]:grid-cols-1">
          <Reveal as="aside" className="self-start min-[861px]:sticky min-[861px]:top-32">
            <p className="eyebrow mb-4">Stack</p>
            <ul className="flex flex-wrap gap-2 min-[861px]:flex-col min-[861px]:gap-0">
              {project.stack.map((tool) => {
                const skill = skillForTool(tool)
                return (
                  <li
                    key={tool}
                    className="min-[861px]:border-b min-[861px]:border-line-soft min-[861px]:py-2 min-[861px]:last:border-b-0"
                  >
                    {skill ? (
                      <Link
                        to={skillHref(skill)}
                        title={`Projects using ${skill}`}
                        className="text-[0.95rem] text-ink-soft underline-offset-4 transition-colors duration-300 ease-editorial hover:text-ink hover:underline max-[860px]:tag-pill max-[860px]:no-underline"
                      >
                        {tool}
                      </Link>
                    ) : (
                      <span className="text-[0.95rem] text-ink-soft max-[860px]:tag-pill">{tool}</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </Reveal>

          <div className="max-w-[68ch]">
            {sections.map((section) => (
              <Reveal as="section" key={section.label} className="mb-12">
                <h2 className="eyebrow mb-3">{section.label}</h2>
                <p className="text-[1.05rem] leading-[1.75] text-ink-soft">{section.text}</p>
              </Reveal>
            ))}
            <Reveal
              as="blockquote"
              className="border-t border-line pt-8 font-serif text-[clamp(1.5rem,2.8vw,2.1rem)] leading-[1.3] italic"
            >
              {project.keyDetail}
            </Reveal>
          </div>
        </div>

        {media.length > 0 && (
          <section className="mt-[clamp(64px,9vw,112px)]">
            <Reveal as="h2" className="mb-8 font-serif text-[clamp(1.6rem,3vw,2.2rem)]">
              From the gallery
            </Reveal>
            <Reveal
              as="ul"
              depth
              className="grid grid-cols-3 gap-[clamp(20px,3vw,32px)] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1"
            >
              {media.map((item, i) => (
                <GalleryTile key={item.key} item={item} onOpen={() => lightbox.open(i)} showLink={false} />
              ))}
            </Reveal>
          </section>
        )}

        <nav
          aria-label="More projects"
          className="mt-[clamp(64px,9vw,112px)] grid grid-cols-2 border-t border-line max-[600px]:grid-cols-1"
        >
          <Link to={projectHref(previous.slug)} className="group py-8 pr-6">
            <span className="eyebrow mb-2 block">
              <span aria-hidden="true">←</span> Previous
            </span>
            <span className="font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-[1.25] transition-opacity duration-300 ease-editorial group-hover:opacity-60">
              {previous.title}
            </span>
          </Link>
          <Link
            to={projectHref(next.slug)}
            className="group border-l border-line py-8 pl-6 text-right max-[600px]:border-t max-[600px]:border-l-0 max-[600px]:pl-0 max-[600px]:text-left"
          >
            <span className="eyebrow mb-2 block">
              Next <span aria-hidden="true">→</span>
            </span>
            <span className="font-serif text-[clamp(1.2rem,2.2vw,1.6rem)] leading-[1.25] transition-opacity duration-300 ease-editorial group-hover:opacity-60">
              {next.title}
            </span>
          </Link>
        </nav>
      </div>

      {lightbox.index !== null && (
        <Lightbox
          items={media}
          index={lightbox.index}
          onClose={lightbox.close}
          onNext={lightbox.next}
          onPrev={lightbox.prev}
        />
      )}
    </article>
  )
}
