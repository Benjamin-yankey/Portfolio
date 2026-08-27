import type { GithubProject } from '../../data/githubProjects'
import { SceneBillboard } from '../scene-billboard/SceneBillboard'
import { colorForIndex } from './palette'

interface VillageBillboardProps {
  outerRef: React.RefObject<HTMLDivElement | null>
  project: (GithubProject & { index: number }) | null
}

/**
 * The repo card that sits on top of a house — raised either by pointing at
 * the house or by parking the car outside it.
 *
 * No tether, unlike the splash toy's: the camera can drive right up to a
 * house or view it from across the field, so a fixed-pixel tether would
 * detach as the house scales. Anchoring the card's bottom edge on the roof
 * apex instead keeps it attached at every distance for free.
 */
export function VillageBillboard({ outerRef, project }: Readonly<VillageBillboardProps>) {
  return (
    <SceneBillboard
      outerRef={outerRef}
      visible={project !== null}
      accent={project ? colorForIndex(project.index) : undefined}
      cardClassName="w-[min(14rem,58vw)] p-3.5"
    >
      {/* Held in the DOM through the fade-out rather than unmounted, so the
          card animates away instead of vanishing. */}
      <p className="eyebrow mb-1">Repository</p>
      <p className="mb-1.5 font-serif text-[1rem] leading-[1.25]">
        {project?.displayName ?? ''}
      </p>
      <p className="flex items-center gap-2 text-[0.75rem] text-muted">
        <span>{project?.language ?? ''}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold tracking-[0.05em] text-ink-soft/75 uppercase">
          Click to open
        </span>
      </p>
    </SceneBillboard>
  )
}
