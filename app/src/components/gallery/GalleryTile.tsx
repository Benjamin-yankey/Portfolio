import type { GalleryMedia } from '../../data/gallery'
import { Tilt3D } from '../Tilt3D'

interface GalleryTileProps {
  item: GalleryMedia
  onOpen: () => void
  /** Hide the repo link where the page already links to the repo. */
  showLink?: boolean
}

/** A gallery thumbnail that opens the lightbox, with its title and caption below. */
export function GalleryTile({ item, onOpen, showLink = true }: Readonly<GalleryTileProps>) {
  return (
    <li>
      <Tilt3D
        as="button"
        type="button"
        onClick={onOpen}
        maxTilt={4}
        lift={12}
        aria-label={`Open ${item.title}`}
        className="block w-full text-left"
        planeClassName="relative overflow-hidden rounded-2xl border border-line"
      >
        {item.type === 'video' ? (
          <>
            <video
              src={item.src}
              poster={item.poster}
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-[4/3] w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-panel/80 text-paper">
                <PlayIcon />
              </span>
            </span>
          </>
        ) : (
          <img
            src={item.src}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
          />
        )}
      </Tilt3D>
      <p className="mt-3 font-serif text-[1.05rem]">{item.title}</p>
      {(item.category || item.date) && (
        <p className="mt-0.5 text-[0.78rem] tracking-[0.04em] text-muted uppercase">
          {[item.category, item.date].filter(Boolean).join(' · ')}
        </p>
      )}
      {item.caption && <p className="mt-1 text-[0.9rem] text-muted">{item.caption}</p>}
      {showLink && item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-[0.75rem] font-semibold tracking-[0.1em] text-ink-soft uppercase underline-offset-4 hover:underline"
        >
          View on GitHub <span aria-hidden="true">↗</span>
        </a>
      )}
    </li>
  )
}

function PlayIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
