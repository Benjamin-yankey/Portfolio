import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTypewriter } from '../../hooks/useTypewriter'

const INTRO_COPY =
  'A behind-the-scenes look — builds shipped, systems stood up, and the moments in between. Move your mouse across the frame to scrub through.'

/**
 * Full-bleed video hero that opens the Gallery page, same "hero, then
 * content section" shape as Contact's split hero. The clip plays as ambient
 * loop by default; on desktop, moving the pointer across the frame takes
 * over and scrubs playback to the pointer's horizontal position instead —
 * paused as long as the pointer is inside, resuming the loop on exit.
 *
 * Seeking is coalesced through `targetTime`/`isSeeking` rather than set
 * directly on every mousemove: a compressed video only has full frames a
 * couple of seconds apart, so firing `currentTime = x` dozens of times a
 * second queues up a backlog of seeks the decoder is still working through,
 * which reads as the scrub lagging behind the pointer. Tracking one target
 * and only starting the next seek once `seeked` fires for the last one
 * keeps the video always chasing the *latest* pointer position instead.
 */
export function GalleryIntro() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const targetTime = useRef(0)
  const isSeeking = useRef(false)
  const prefersReducedMotion = useReducedMotion()
  const { displayed, done } = useTypewriter(INTRO_COPY, 14, 150)
  const [mounted, setMounted] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [prefersReducedMotion])

  function seekTo(time: number) {
    const video = videoRef.current
    if (!video) return
    targetTime.current = time
    if (!isSeeking.current) {
      isSeeking.current = true
      video.currentTime = time
    }
  }

  function handleSeeked() {
    const video = videoRef.current
    if (!video) return
    if (Math.abs(video.currentTime - targetTime.current) > 0.05) {
      video.currentTime = targetTime.current
    } else {
      isSeeking.current = false
    }
  }

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const video = videoRef.current
    if (!video || prefersReducedMotion || !video.duration) return

    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    seekTo(ratio * video.duration)
  }

  function handleMouseEnter() {
    if (prefersReducedMotion) return
    videoRef.current?.pause()
  }

  function handleMouseLeave() {
    if (prefersReducedMotion) return
    videoRef.current?.play().catch(() => {})
  }

  function scrollToGrid() {
    document
      .getElementById('gallery-grid')
      ?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <section
      className="relative flex h-[86vh] min-h-[520px] w-full items-end overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        onSeeked={handleSeeked}
        src="/Portfolio/videos/gallery-intro.mp4"
        aria-hidden="true"
        tabIndex={-1}
        autoPlay={!prefersReducedMotion}
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/5 to-transparent"
      />

      <div
        className={[
          'container-page relative z-10 pb-[clamp(40px,6vw,72px)] text-cream transition-all duration-500 ease-editorial',
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        ].join(' ')}
      >
        <p className="eyebrow mb-4 text-cream/70">Gallery — Behind the scenes</p>
        <h1 className="mb-5 max-w-[16ch] font-serif text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.05] tracking-[-0.01em]">
          Moments from the work
        </h1>
        <p className="mb-8 min-h-[3.4em] max-w-[56ch] text-[1.02rem] leading-[1.7] text-cream/85">
          {displayed}
          {!done && (
            <span className="ml-[2px] inline-block h-[1em] w-[2px] translate-y-[2px] animate-cursor-blink bg-cream align-middle" />
          )}
        </p>
        <button
          type="button"
          onClick={scrollToGrid}
          className="inline-flex items-center gap-2.5 rounded-full border border-cream/40 px-6 py-3 text-[13px] font-semibold tracking-[0.1em] text-cream uppercase transition-all duration-300 ease-editorial hover:-translate-y-1 hover:border-cream hover:bg-cream hover:text-ink"
        >
          See the gallery <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  )
}
