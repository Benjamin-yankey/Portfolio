import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { Project } from '../../data/projects'
import { usePointerTilt } from '../../hooks/usePointerTilt'
import { projectHref } from '../../lib/routes'

interface ProjectRowProps {
  project: Project
}

/** One row of the Projects list — the whole row links to the project's page. */
export function ProjectRow({ project }: Readonly<ProjectRowProps>) {
  // A wide row needs a much gentler angle than a compact card — the same
  // degrees swing the far edge through far more pixels, which turns into a
  // seasick lurch. A long viewing distance flattens it further still.
  const rowRef = usePointerTilt<HTMLAnchorElement>({ maxTilt: 2.4, lift: 22 })

  return (
    <li
      className="scene-3d border-b border-line"
      style={{ '--scene-perspective': '1800px' } as CSSProperties}
    >
      <Link
        ref={rowRef}
        to={projectHref(project.slug)}
        className="plane-3d group grid w-full grid-cols-[48px_1fr_200px_auto] items-center gap-[clamp(16px,3vw,40px)] py-[clamp(26px,3.6vw,40px)] max-[860px]:grid-cols-[32px_1fr_34px] max-[600px]:gap-4"
      >
        {/* Only the link's *direct* children can be depth-layered: a
            translateZ deeper in the tree would be flattened by the first
            ancestor without preserve-3d. The index sits nearly on the
            surface and the title stands off it, so the row gains a shallow
            relief as it turns instead of moving as one rigid slab. */}
        <span className="layer-3d text-[13px] font-semibold tracking-[0.05em] text-muted group-hover:[--layer-z:12px]">
          {project.num}
        </span>

        <span className="layer-3d min-w-0 group-hover:[--layer-z:30px]">
          <span className="mb-1.5 block font-serif text-[clamp(1.5rem,3.2vw,2.4rem)] leading-[1.15] transition-opacity duration-300 ease-editorial group-hover:opacity-60">
            {project.title}
          </span>
          <span className="block max-w-[46ch] text-[0.95rem] text-muted">{project.summary}</span>
          <span className="mt-1 flex flex-wrap gap-x-2.5 gap-y-2">
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </span>
        </span>

        <span className="layer-3d aspect-[16/10] overflow-hidden rounded-xl border border-line bg-cream-deep group-hover:[--layer-z:24px] max-[860px]:hidden">
          {project.image && (
            <img
              src={project.image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-editorial group-hover:scale-[1.04]"
            />
          )}
        </span>

        <span
          aria-hidden="true"
          className="layer-3d ml-auto flex h-8.5 w-8.5 flex-shrink-0 items-center justify-center rounded-full border border-ink transition-colors duration-300 ease-editorial group-hover:bg-ink group-hover:text-cream group-hover:[--layer-z:44px]"
        >
          <ArrowIcon />
        </span>
      </Link>
    </li>
  )
}

function ArrowIcon() {
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
