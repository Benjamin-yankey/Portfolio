import type { Project } from '../../data/projects'

interface ProjectItemProps {
  project: Project
  isOpen: boolean
  onToggle: () => void
}

export function ProjectItem({ project, isOpen, onToggle }: Readonly<ProjectItemProps>) {
  return (
    <li className="border-b border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group grid w-full grid-cols-[48px_1fr_auto] items-center gap-[clamp(16px,3vw,40px)] py-[clamp(26px,3.6vw,40px)] text-left max-[600px]:grid-cols-[32px_1fr_34px] max-[600px]:gap-4"
      >
        <span className="text-[13px] font-semibold tracking-[0.05em] text-muted">
          {project.num}
        </span>

        <span className="min-w-0">
          <span className="mb-1.5 block font-serif text-[clamp(1.5rem,3.2vw,2.4rem)] leading-[1.15] transition-opacity duration-300 ease-editorial group-hover:opacity-60">
            {project.title}
          </span>
          <span className="block max-w-[46ch] text-[0.95rem] text-muted">
            {project.summary}
          </span>
          <span className="mt-1 flex flex-wrap gap-x-2.5 gap-y-2">
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </span>
        </span>

        <span
          aria-hidden="true"
          className={[
            'relative ml-auto h-8.5 w-8.5 flex-shrink-0 rounded-full border border-ink transition-transform duration-[400ms] ease-editorial',
            isOpen ? 'rotate-90' : 'rotate-0',
          ].join(' ')}
        >
          <span className="absolute top-1/2 left-1/2 h-[1.5px] w-3 -translate-x-1/2 -translate-y-1/2 bg-ink transition-transform duration-[350ms] ease-editorial" />
          <span
            className={[
              'absolute top-1/2 left-1/2 h-3 w-[1.5px] -translate-x-1/2 -translate-y-1/2 bg-ink transition-all duration-[350ms] ease-editorial',
              isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100',
            ].join(' ')}
          />
        </span>
      </button>

      <div
        className={[
          'grid transition-[grid-template-rows,opacity] duration-500 ease-editorial',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        ].join(' ')}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-[48px_1fr] gap-[clamp(16px,3vw,40px)] pb-[clamp(32px,4vw,48px)] max-[860px]:grid-cols-1">
            <span aria-hidden="true" className="max-[860px]:hidden" />
            <div>
              <div className="grid max-w-[880px] grid-cols-3 gap-7 max-[860px]:grid-cols-1">
                <div>
                  <h4 className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Problem
                  </h4>
                  <p className="text-[0.96rem] leading-[1.65] text-ink-soft">{project.problem}</p>
                </div>
                <div>
                  <h4 className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Solution
                  </h4>
                  <p className="text-[0.96rem] leading-[1.65] text-ink-soft">{project.solution}</p>
                </div>
                <div>
                  <h4 className="mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                    Role
                  </h4>
                  <p className="text-[0.96rem] leading-[1.65] text-ink-soft">{project.role}</p>
                </div>
              </div>
              <p className="mt-6.5 border-t border-line-soft pt-5.5 font-serif text-[clamp(1.3rem,2.4vw,1.7rem)] italic">
                {project.metric}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
