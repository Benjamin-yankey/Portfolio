import type { Project } from '../../data/projects'
import { SceneBillboard } from '../scene-billboard/SceneBillboard'

interface ExploreBillboardProps {
  outerRef: React.RefObject<HTMLDivElement | null>
  project: Project | null
}

/** Tether length in CSS px. A fixed value is correct here and only here:
 *  the splash camera holds a constant distance behind the avatar, so the
 *  on-screen gap between the anchor above its head and the head itself
 *  never changes — 44px is that gap, measured. */
const TETHER_PX = 44

/**
 * The card that rides above the splash avatar's head once it walks into a
 * marker cone. Content only — the positioning, transition and tether are
 * SceneBillboard's job.
 */
export function ExploreBillboard({ outerRef, project }: Readonly<ExploreBillboardProps>) {
  return (
    <SceneBillboard outerRef={outerRef} visible={project !== null} tetherPx={TETHER_PX}>
      {/* Held in the DOM through the fade-out instead of unmounting on
          `project === null`, so the card animates away rather than
          vanishing. Falls back to the last-known copy for exactly as long as
          that transition runs. */}
      <p className="eyebrow mb-1.5">{project?.num ?? ''} — Project</p>
      <p className="mb-2 font-serif text-[1.05rem] leading-[1.25]">{project?.title ?? ''}</p>
      <p className="mb-3 text-[0.8rem] leading-[1.5] text-ink-soft/80">{project?.summary ?? ''}</p>
      <p className="flex flex-wrap gap-1.5">
        {(project?.tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="tag-pill px-2 py-1 text-[10px]">
            {tag}
          </span>
        ))}
      </p>
    </SceneBillboard>
  )
}
