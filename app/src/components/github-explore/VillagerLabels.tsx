import { VILLAGERS } from './villagers'

interface VillagerLabelsProps {
  /** One per villager, in VILLAGERS order. Each is moved every frame by that
   *  villager's own frame loop — see Villager in GithubExploreScene. */
  refs: React.RefObject<HTMLDivElement | null>[]
}

/**
 * Name tags for the residents. Small, quiet pills rather than full cards:
 * six of these are on screen at once, and the house card is the thing that
 * should hold attention — these are labels, not content.
 *
 * Each starts at `opacity-0` and is only revealed once its frame loop has
 * projected it somewhere, so none of them flash at the panel's top-left
 * corner on the first paint before the scene chunk has loaded.
 */
export function VillagerLabels({ refs }: Readonly<VillagerLabelsProps>) {
  return (
    <>
      {VILLAGERS.map((villager, i) => (
        <div
          key={villager.label}
          ref={refs[i]}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-10 opacity-0 will-change-transform"
        >
          <span
            style={{ borderBottomColor: villager.color }}
            className="absolute bottom-0 left-0 -translate-x-1/2 rounded-full border border-b-2 border-white/60 bg-white/75 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.04em] whitespace-nowrap text-ink-soft shadow-[0_6px_16px_rgba(26,26,26,0.14)] backdrop-blur-sm"
          >
            {villager.label}
          </span>
        </div>
      ))}
    </>
  )
}
