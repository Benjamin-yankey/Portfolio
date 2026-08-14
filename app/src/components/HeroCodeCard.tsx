import { certifications, skillCategories } from '../data/skills'
import { Tilt3D } from './Tilt3D'

const STATS = [
  { value: `${certifications.length}`, label: 'Certs' },
  { value: `${skillCategories.length}`, label: 'Skills' },
  { value: '5+', label: 'Years' },
]

/**
 * A second, code-shaped self-introduction below the portrait: the same
 * "who I am" facts as the hero copy, restated as an object literal so the
 * card reads as evidence rather than a repeated claim. Dark instead of
 * cream — the one inversion on the page — so it presents as a distinct
 * artifact (a terminal window) rather than another content card. Sits in
 * its own row rather than floating over the portrait, so nothing (the
 * face, the code) is ever partially hidden behind the other.
 */
export function HeroCodeCard() {
  return (
    <Tilt3D
      maxTilt={6}
      lift={16}
      perspective={1400}
      className="group w-[clamp(280px,22vw,340px)]"
      planeClassName="relative rounded-2xl bg-ink shadow-[0_30px_70px_rgba(26,26,26,0.35)]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-2 -right-2 z-10 rounded-full border border-line bg-cream px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-ink uppercase shadow-[0_10px_24px_rgba(26,26,26,0.18)]"
      >
        Reliability-first
      </span>

      <div className="flex items-center gap-1.5 border-b border-white/10 px-5 py-3.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/25" />
        <span className="ml-2 truncate font-mono text-[11px] tracking-[0.02em] text-white/40">
          ~/benjamin/portfolio
        </span>
      </div>

      <pre className="overflow-x-auto px-5 py-5 font-mono text-[0.74rem] leading-[1.7] text-white/85">
        <code>
          <span className="text-white/40">const</span> benjamin = {'{'}
          {'\n'}  role: [<span className="text-cream">"DevOps"</span>,{' '}
          <span className="text-cream">"SRE"</span>],{'\n'}  stack: [
          <span className="text-cream">"AWS"</span>,{' '}
          <span className="text-cream">"IaC"</span>,{' '}
          <span className="text-cream">"K8s"</span>],{'\n'}  ships: (release) =&gt;{'\n'}
          {'    '}build(release).then(deploy),{'\n'}
          {'}'};{'\n'}
          {'\n'}benjamin.ships(<span className="text-cream">"reliability"</span>);<span aria-hidden="true" className="animate-cursor-blink text-cream">▊</span>
        </code>
      </pre>

      <div className="grid grid-cols-3 gap-px border-t border-white/10 bg-white/10">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-ink px-3 py-4 text-center">
            <p className="font-serif text-[1.3rem] leading-none text-cream">{stat.value}</p>
            <p className="mt-1.5 text-[10px] tracking-[0.08em] text-white/45 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </Tilt3D>
  )
}
