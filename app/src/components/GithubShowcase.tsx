import { githubProjects } from "../data/githubProjects";
import { githubStats } from "../data/githubStats";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Tilt3D } from "./Tilt3D";
import { GithubExploreMount } from "./github-explore/GithubExploreMount";

const STATS = [
  { value: `${githubStats.repositories}+`, label: "Repositories" },
  { value: `${githubStats.followers}`, label: "Followers" },
  { value: `${githubStats.starred}`, label: "Starred" },
  { value: `${githubStats.memberSince}`, label: "On GitHub since" },
];

/**
 * A second, deliberately different toy: every real repo pulled live from
 * GitHub, set in a colorful lit field instead of the ink-on-cream
 * wireframe used everywhere else — drive with the keyboard
 * (arrows or WASD) instead of clicking or following the pointer. The mount
 * sits outside `container-page` deliberately, so it spans the full viewport
 * width instead of stopping at the article column like the rest of the
 * page's content.
 */
export function GithubShowcase() {
  return (
    <section className="section border-t border-line-soft">
      <div className="container-page">
        <SectionHeading title="On GitHub" />

        <Reveal
          as="p"
          className="mb-10 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft"
        >
          Every repository on my GitHub, not a curated few — one house each.
          Drive with the arrow keys or WASD, hover a house to see which repo
          it is, click it to open the code.
        </Reveal>

        <Reveal
          as="div"
          depth
          className="mb-[clamp(56px,7vw,88px)] grid grid-cols-[1.3fr_1fr] gap-[clamp(24px,4vw,48px)] max-[860px]:grid-cols-1"
        >
          {/* The calendar image comes straight from GitHub's own public
              contribution data via a third-party renderer (no auth token,
              so no server-side piece needed for a static site) — it always
              reflects the real, current graph rather than a baked snapshot. */}
          <Tilt3D
            maxTilt={3}
            lift={14}
            perspective={1800}
            className="group"
            planeClassName="rounded-2xl border border-line bg-white/40 p-[clamp(20px,3vw,32px)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="eyebrow">@{githubStats.username}</span>
              <a
                href={`https://github.com/${githubStats.username}`}
                className="border-b border-transparent pb-0.5 text-[13px] font-semibold tracking-[0.06em] text-ink-soft uppercase transition-all duration-300 ease-editorial hover:border-ink hover:text-ink"
              >
                Visit profile →
              </a>
            </div>
            <img
              src={`https://ghchart.rshah.org/1a1a1a/${githubStats.username}`}
              alt={`${githubStats.username}'s GitHub contribution graph`}
              className="w-full"
              loading="lazy"
            />
          </Tilt3D>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line-soft">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-cream px-4 py-6 text-center">
                <p className="font-serif text-[clamp(1.8rem,3vw,2.4rem)] leading-none">
                  {stat.value}
                </p>
                <p className="mt-2 text-[11px] tracking-[0.06em] text-muted uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal as="div">
        <GithubExploreMount projects={githubProjects} />
      </Reveal>
    </section>
  );
}
