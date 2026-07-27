import type { CSSProperties } from 'react'
import type { Project } from '../../data/projects'
import { usePointerTilt } from '../../hooks/usePointerTilt'

interface ProjectItemProps {
  project: Project
  isOpen: boolean
  onToggle: () => void
}

export function ProjectItem({ project, isOpen, onToggle }: Readonly<ProjectItemProps>) {
  // A wide row needs a much gentler angle than a compact card — the same
  // degrees swing the far edge through far more pixels, which turns into a
  // seasick lurch. A long viewing distance flattens it further still.
  const rowRef = usePointerTilt<HTMLButtonElement>({ maxTilt: 2.4, lift: 22 })

  return (
    // Perspective lives on the <li>, but preserve-3d deliberately does not:
    // the panel below relies on `overflow-hidden` to clip its grid-rows
    // collapse, and preserve-3d on an ancestor disables that clipping.
    <li
      className="scene-3d border-b border-line"
      style={{ '--scene-perspective': '1800px' } as CSSProperties}
    >
      <button
        ref={rowRef}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="plane-3d group grid w-full grid-cols-[48px_1fr_auto] items-center gap-[clamp(16px,3vw,40px)] py-[clamp(26px,3.6vw,40px)] text-left max-[600px]:grid-cols-[32px_1fr_34px] max-[600px]:gap-4"
      >
        {/* Only the button's *direct* children can be depth-layered: a
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

        {/* Rotation and depth are written as one inline transform rather
            than a rotate utility plus `layer-3d`, which would both target
            `transform` and clobber each other. */}
        <span
          aria-hidden="true"
          className="relative ml-auto h-8.5 w-8.5 flex-shrink-0 rounded-full border border-ink transition-transform duration-[400ms] ease-editorial group-hover:[--layer-z:44px]"
          style={{ transform: `translateZ(var(--layer-z, 0px)) rotate(${isOpen ? 90 : 0}deg)` }}
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
          {/* The fold. Hinged along its top edge so the panel swings down
              into place like a flap rather than just un-squashing, and
              given its own `perspective()` because the <li> can't share one
              across the overflow-hidden clip above. Slightly slower than
              the height transition so the panel is still settling flat as
              the row finishes opening. */}
          <div
            className="origin-top transition-transform duration-[620ms] ease-editorial"
            style={{
              transform: `perspective(1100px) rotateX(${isOpen ? 0 : -14}deg)`,
            }}
          >
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
      </div>
    </li>
  )
}
