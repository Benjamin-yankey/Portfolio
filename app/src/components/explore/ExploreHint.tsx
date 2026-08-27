interface ExploreHintProps {
  showHint: boolean
}

/**
 * The toy's only instructions, and only until they're not needed: a one-time
 * "click to walk" nudge that retires on the first interaction. Naming what
 * the avatar has walked up to is the billboard's job now (see
 * ExploreBillboard) — stating it down here too would put the same title on
 * screen twice.
 */
export function ExploreHint({ showHint }: Readonly<ExploreHintProps>) {
  if (!showHint) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-5 sm:justify-start sm:p-7">
      <span className="rounded-full border border-white/50 bg-white/40 px-4 py-2 text-[0.76rem] font-semibold tracking-[0.06em] text-ink-soft/80 uppercase shadow-[0_8px_20px_rgba(26,26,26,0.08)] backdrop-blur-md">
        Click to walk →
      </span>
    </div>
  )
}
