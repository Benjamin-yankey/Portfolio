import type { MouseEvent } from 'react'
import type { GalleryItem } from '../../data/gallery'

interface LightboxProps {
  items: GalleryItem[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

/**
 * Full-screen viewer, not a portal — same non-portal `fixed inset-0`
 * approach OverlayNav already uses, at the same z-50 layer. Backdrop click
 * closes; clicks on the content card or the prev/next/close buttons stop
 * propagation so they don't also trigger the backdrop's close.
 */
export function Lightbox({ items, index, onClose, onNext, onPrev }: Readonly<LightboxProps>) {
  const item = items[index]
  if (!item) return null

  function stop(event: MouseEvent) {
    event.stopPropagation()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-6 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors duration-300 ease-editorial hover:border-cream hover:bg-cream hover:text-ink"
      >
        <CloseIcon />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(event) => {
              stop(event)
              onPrev()
            }}
            aria-label="Previous"
            className="absolute top-1/2 left-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors duration-300 ease-editorial hover:border-cream hover:bg-cream hover:text-ink sm:left-8"
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              stop(event)
              onNext()
            }}
            aria-label="Next"
            className="absolute top-1/2 right-4 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/30 text-cream transition-colors duration-300 ease-editorial hover:border-cream hover:bg-cream hover:text-ink sm:right-8"
          >
            <ChevronIcon direction="right" />
          </button>
        </>
      )}

      <div className="flex max-h-full w-full max-w-4xl flex-col items-center gap-5" onClick={stop}>
        {item.video ? (
          <video
            key={item.video}
            src={item.video}
            controls
            autoPlay
            playsInline
            className="max-h-[65vh] w-full rounded-2xl bg-black object-contain"
          />
        ) : (
          <img
            key={item.image}
            src={item.image}
            alt={item.title}
            className="max-h-[65vh] w-full rounded-2xl object-contain"
          />
        )}

        <div className="text-center text-cream">
          <p className="font-serif text-[1.3rem]">{item.title}</p>
          {(item.category || item.date) && (
            <p className="mt-1 text-[0.78rem] tracking-[0.08em] text-cream/60 uppercase">
              {[item.category, item.date].filter(Boolean).join(' · ')}
            </p>
          )}
          {item.caption && (
            <p className="mt-2 max-w-[60ch] text-[0.9rem] text-cream/80">{item.caption}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CloseIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  )
}

function ChevronIcon({ direction }: Readonly<{ direction: 'left' | 'right' }>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: direction === 'left' ? 'none' : 'scaleX(-1)' }}
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}
