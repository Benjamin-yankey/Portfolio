import { Reveal } from './Reveal'

interface SectionHeadingProps {
  title: string
  index: string
}

/** The recurring "title + 01 — Label" header used by every content section. */
export function SectionHeading({ title, index }: Readonly<SectionHeadingProps>) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-start justify-between gap-6 sm:mb-14">
      <h2 className="font-serif text-[clamp(2.4rem,5.4vw,4.4rem)] leading-none tracking-[-0.01em]">
        {title}
      </h2>
      <span className="mt-[clamp(10px,1.6vw,20px)] text-xs font-semibold tracking-[0.18em] text-muted">
        {index}
      </span>
    </Reveal>
  )
}
