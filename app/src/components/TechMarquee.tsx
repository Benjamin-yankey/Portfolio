import { skillCategories } from '../data/skills'

const TECH = Array.from(new Set(skillCategories.flatMap((category) => category.items)))
// Repeated twice back-to-back so the marquee-left animation's -50% shift
// loops seamlessly, same trick as HeroMarquee.
const SEGMENT = [...TECH, ...TECH]

/** A quiet, low-key strip between the hero and the GitHub showcase — the
 *  same tech list as the Skills page, restated as a single scanning line
 *  rather than grouped cards, so it reads at a glance while scrolling past. */
export function TechMarquee() {
  return (
    <div className="border-y border-line-soft py-[clamp(20px,3vw,28px)]">
      <p className="eyebrow container-page mb-5 text-center">Tech I work with</p>
      <div
        className="overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage:
            'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="animate-marquee-left flex w-max gap-3" style={{ animationDuration: '48s' }}>
          {SEGMENT.map((tech, i) => (
            <span key={`${tech}-${i}`} className="tag-pill shrink-0 bg-white/40">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
