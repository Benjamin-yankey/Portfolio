import type { GithubProject } from "../../data/githubProjects";
import { colorForIndex } from "./palette";

interface GithubExploreHintProps {
  project: (GithubProject & { index: number }) | null;
  showHint: boolean;
}

/** The toy's only instructions: a repo card once the figure wanders up to
 *  one, or a one-time "move your cursor" nudge before the first movement. */
export function GithubExploreHint({
  project,
  showHint,
}: Readonly<GithubExploreHintProps>) {
  if (!project && !showHint) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-5 sm:justify-start sm:p-7">
      {project ? (
        <span
          className="flex items-center gap-3 rounded-full border border-white/60 bg-white/70 py-2 pr-5 pl-3 text-[0.85rem] font-medium text-ink shadow-[0_10px_28px_rgba(26,26,26,0.14)] backdrop-blur-md"
          style={{
            borderLeftWidth: "4px",
            borderLeftColor: colorForIndex(project.index),
          }}
        >
          {project.displayName}
          <span className="text-[0.75rem] font-normal text-muted">
            {project.language}
          </span>
        </span>
      ) : (
        <span className="rounded-full border border-white/50 bg-white/45 px-4 py-2 text-[0.76rem] font-semibold tracking-[0.06em] text-ink-soft/80 uppercase shadow-[0_8px_20px_rgba(26,26,26,0.08)] backdrop-blur-md"></span>
      )}
    </div>
  );
}
