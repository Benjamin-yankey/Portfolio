interface ExploreHintProps {
  activeTitle: string | null
  showHint: boolean
}

/**
 * The toy's only instructions, and only when it needs them: a project's
 * title once the avatar has walked up to it, or a one-time "click to walk"
 * nudge before the first interaction. Nothing else — this sits inside a
 * side panel, not a page, so it stays out of the way of the actual pitch
 * (the headline and copy next to it).
 */
export function ExploreHint({ activeTitle, showHint }: Readonly<ExploreHintProps>) {
  if (!activeTitle && !showHint) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-5 sm:justify-start sm:p-7">
      {activeTitle ? (
        <span className="rounded-full border border-white/60 bg-white/65 px-4 py-2 text-center text-[0.82rem] font-medium text-ink-soft shadow-[0_8px_24px_rgba(26,26,26,0.12)] backdrop-blur-md">
          {activeTitle}
        </span>
      ) : (
        <span className="rounded-full border border-white/50 bg-white/40 px-4 py-2 text-[0.76rem] font-semibold tracking-[0.06em] text-ink-soft/80 uppercase shadow-[0_8px_20px_rgba(26,26,26,0.08)] backdrop-blur-md">
          Click to walk →
        </span>
      )}
    </div>
  )
}
