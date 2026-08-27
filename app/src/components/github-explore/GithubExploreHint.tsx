interface GithubExploreHintProps {
  /** False once the visitor has actually pressed a drive key. */
  showHint: boolean
}

function Key({ children }: Readonly<{ children: string }>) {
  return (
    <kbd className="inline-flex min-w-[1.55rem] items-center justify-center rounded-[5px] border border-ink/15 border-b-2 bg-white/80 px-1 py-0.5 font-sans text-[0.7rem] font-semibold text-ink-soft">
      {children}
    </kbd>
  )
}

/**
 * What you can do here, and how.
 *
 * The panel is a keyboard-driven toy sitting in the middle of a scrolling
 * page, which is not a thing a visitor expects or goes looking for — so the
 * controls are stated outright and permanently, in the corner, rather than
 * left to be discovered. The opening call to action is louder and retires
 * itself on the first key press; the corner legend stays, because someone
 * returning to the panel after scrolling away shouldn't have to remember.
 *
 * Naming the active house is the billboard's job (see VillageBillboard) —
 * it labels the house itself, which is more use than a caption in a corner
 * that makes you work out which of sixty-odd houses it means.
 */
export function GithubExploreHint({ showHint }: Readonly<GithubExploreHintProps>) {
  return (
    <>
      {/* Bottom-right, not top-right: the page's fixed top bar floats over
          this panel's upper edge, so anything anchored to the panel's top
          gets covered by it. The opening call to action takes the bottom
          *left*, so the two never meet. */}
      <div className="pointer-events-none absolute right-0 bottom-0 z-30 p-4 sm:p-5">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/50 bg-white/55 px-3.5 py-3 shadow-[0_8px_24px_rgba(26,26,26,0.1)] backdrop-blur-md">
          <span className="flex items-center gap-2 text-[0.72rem] text-ink-soft">
            <span className="flex gap-1">
              <Key>W</Key>
              <Key>A</Key>
              <Key>S</Key>
              <Key>D</Key>
            </span>
            <span className="text-muted">or arrows — drive</span>
          </span>
          <span className="text-[0.72rem] text-ink-soft">
            <span className="text-muted">Hover a house — see the repo</span>
          </span>
          <span className="text-[0.72rem] text-ink-soft">
            <span className="text-muted">Click it — open on GitHub</span>
          </span>
        </div>
      </div>

      {/* Opening call to action. Rendered unconditionally and faded out
          rather than unmounted, so it leaves rather than blinks off the
          instant a key goes down. */}
      <div
        className={[
          'pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-start p-5 sm:p-7',
          'transition-[opacity,transform] duration-500 ease-editorial',
          showHint ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
        ].join(' ')}
      >
        <span className="flex items-center gap-2.5 rounded-full border border-white/60 bg-white/75 py-2.5 pr-5 pl-4 text-[0.82rem] text-ink shadow-[0_10px_28px_rgba(26,26,26,0.16)] backdrop-blur-md">
          <span className="flex gap-1">
            <Key>W</Key>
            <Key>A</Key>
            <Key>S</Key>
            <Key>D</Key>
          </span>
          <span>
            <span className="font-semibold">This one you drive.</span>{' '}
            <span className="text-muted">Hover the panel, then steer.</span>
          </span>
        </span>
      </div>
    </>
  )
}
