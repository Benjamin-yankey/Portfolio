import type { GithubProject } from '../../data/githubProjects'
import { colorForIndex } from './palette'

interface GithubExploreFallbackProps {
  projects: GithubProject[]
}

/**
 * Stands in for the 3D toy on touch devices, low-power machines, and
 * whenever `prefers-reduced-motion` is set — a real, colorful reading of
 * the same repo list rather than an empty panel or a decorative monogram.
 * Each card is a genuine link straight to GitHub.
 */
export function GithubExploreFallback({ projects }: Readonly<GithubExploreFallbackProps>) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {projects.map((project, i) => (
        <a
          key={project.url}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between gap-6 rounded-2xl border border-line p-4 transition-all duration-300 ease-editorial hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(26,26,26,0.1)]"
          style={{ borderTopWidth: '3px', borderTopColor: colorForIndex(i) }}
        >
          <span className="text-[0.95rem] font-medium text-ink">{project.displayName}</span>
          <span className="flex items-center justify-between text-[0.78rem] text-muted">
            {project.language}
            <span aria-hidden="true" className="transition-transform duration-300 ease-editorial group-hover:translate-x-0.5">
              ↗
            </span>
          </span>
        </a>
      ))}
    </div>
  )
}
