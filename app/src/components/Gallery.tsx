import { useMemo, useState } from 'react'
import { galleryItems } from '../data/gallery'
import { useLightbox } from '../hooks/useLightbox'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { Tilt3D } from './Tilt3D'
import { Lightbox } from './gallery/Lightbox'

const ALL = 'All'

export function Gallery() {
  const items = useMemo(() => galleryItems.filter((item) => item.image || item.video), [])

  const categories = useMemo(() => {
    const found = new Set(
      items.map((item) => item.category).filter((category): category is string => Boolean(category)),
    )
    return [ALL, ...Array.from(found)]
  }, [items])

  const [activeCategory, setActiveCategory] = useState(ALL)
  const filtered =
    activeCategory === ALL ? items : items.filter((item) => item.category === activeCategory)

  const lightbox = useLightbox(filtered.length)

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Gallery" index="05 — Gallery" />

        <Reveal as="p" className="mb-8 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft">
          A few photos and clips from projects, work, and along the way.
        </Reveal>

        {items.length === 0 ? (
          <p className="py-[clamp(28px,3.6vw,40px)] text-[0.96rem] text-muted">
            No items yet — check back later.
          </p>
        ) : (
          <>
            {categories.length > 2 && (
              <Reveal as="div" className="mb-8 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={[
                      'tag-pill transition-colors duration-300 ease-editorial',
                      activeCategory === category ? 'border-ink bg-ink text-cream' : 'hover:border-ink',
                    ].join(' ')}
                  >
                    {category}
                  </button>
                ))}
              </Reveal>
            )}

            <Reveal
              as="ul"
              depth
              className="grid grid-cols-3 gap-[clamp(20px,3vw,32px)] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1"
            >
              {filtered.map((item, index) => (
                <li key={`${item.title}-${index}`}>
                  <Tilt3D
                    as="button"
                    type="button"
                    onClick={() => lightbox.open(index)}
                    maxTilt={4}
                    lift={12}
                    className="block w-full text-left"
                    planeClassName="relative overflow-hidden rounded-2xl border border-line"
                  >
                    {item.video ? (
                      <>
                        <video
                          src={item.video}
                          muted
                          playsInline
                          preload="metadata"
                          className="aspect-[4/3] w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/80 text-cream">
                            <PlayIcon />
                          </span>
                        </span>
                      </>
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
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
                </li>
              ))}
            </Reveal>
          </>
        )}
      </div>

      {lightbox.index !== null && (
        <Lightbox
          items={filtered}
          index={lightbox.index}
          onClose={lightbox.close}
          onNext={lightbox.next}
          onPrev={lightbox.prev}
        />
      )}
    </section>
  )
}

function PlayIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}
