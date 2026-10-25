import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { galleryItems, toGalleryMedia, type GalleryMedia } from '../data/gallery'
import { useLightbox } from '../hooks/useLightbox'
import { FilterChips } from './FilterChips'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { GalleryIntro } from './gallery/GalleryIntro'
import { GalleryTile } from './gallery/GalleryTile'
import { Lightbox } from './gallery/Lightbox'

const ALL = 'All'
/** Group for items saved without a category. */
const OTHER = 'Other'
/** Tiles per category before "Show all" in the grouped view. */
const GROUP_PREVIEW = 6
/** Tiles per batch when one category is selected. */
const PAGE_SIZE = 12

interface Group {
  title: string
  total: number
  shown: GalleryMedia[]
}

const OUTLINE_BUTTON =
  'rounded-full border border-ink px-6 py-3 text-[12px] font-semibold tracking-[0.1em] uppercase transition-colors duration-300 ease-editorial hover:bg-ink hover:text-cream'

/**
 * "All" shows one section per category, each cut to a short preview;
 * picking a category shows just that one in batches. The filter lives in
 * the URL (?category=…) like the Projects filter.
 */
export function Gallery() {
  const items = useMemo(() => toGalleryMedia(galleryItems), [])
  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter((c): c is string => Boolean(c)))),
    [items],
  )

  const [params, setParams] = useSearchParams()
  const requested = params.get('category')
  const active = requested && categories.includes(requested) ? requested : ALL

  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())
  const [pageLimit, setPageLimit] = useState(PAGE_SIZE)

  const groups: Group[] =
    active === ALL
      ? [...categories, OTHER]
          .map((title) => {
            const all = items.filter((item) => (item.category ?? OTHER) === title)
            return { title, total: all.length, shown: expanded.has(title) ? all : all.slice(0, GROUP_PREVIEW) }
          })
          .filter((group) => group.total > 0)
      : (() => {
          const all = items.filter((item) => item.category === active)
          return [{ title: active, total: all.length, shown: all.slice(0, pageLimit) }]
        })()

  // The lightbox steps through exactly what's on screen, in on-screen order;
  // each group's tiles start at its offset in that flat list.
  const visible = groups.flatMap((group) => group.shown)
  const starts = groups.map((_, i) => groups.slice(0, i).reduce((n, group) => n + group.shown.length, 0))
  const lightbox = useLightbox(visible.length)

  function selectCategory(value: string) {
    const next = new URLSearchParams(params)
    if (value === ALL) next.delete('category')
    else next.set('category', value)
    setParams(next, { replace: true })
    setPageLimit(PAGE_SIZE)
  }

  function toggleGroup(title: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const options = [ALL, ...categories].map((value) => ({
    value,
    label: value,
    count: value === ALL ? items.length : items.filter((item) => item.category === value).length,
  }))

  return (
    <>
      <GalleryIntro />

      <section id="gallery-grid" className="section">
        <div className="container-page">
          <SectionHeading title="Gallery" index="05 — Gallery" />

          <Reveal as="p" className="mb-8 max-w-[62ch] text-[0.98rem] leading-[1.7] text-ink-soft">
            Every project on my GitHub, in pictures: live screens, architecture
            diagrams, and pipeline runs. Where a repo has no screenshots, its card
            shows the architecture or file tree straight from the code.
          </Reveal>

          {items.length === 0 ? (
            <p className="py-[clamp(28px,3.6vw,40px)] text-[0.96rem] text-muted">
              No items yet — check back later.
            </p>
          ) : (
            <>
              {categories.length > 1 && (
                <Reveal as="div" className="mb-[clamp(40px,5vw,56px)]">
                  <FilterChips
                    label="Filter gallery by category"
                    options={options}
                    active={active}
                    onChange={selectCategory}
                  />
                </Reveal>
              )}

              {groups.map((group, groupIndex) => {
                const start = starts[groupIndex]
                return (
                  <div key={group.title} className="mb-[clamp(56px,7vw,88px)] last:mb-0">
                    {active === ALL && (
                      <Reveal
                        as="div"
                        className="mb-6 flex items-baseline justify-between gap-4 border-b border-line pb-3"
                      >
                        <h3 className="font-serif text-[clamp(1.4rem,2.6vw,1.9rem)]">
                          {group.title}
                          <span className="ml-2.5 align-middle text-[0.8rem] font-sans text-muted">
                            {group.total}
                          </span>
                        </h3>
                        {group.total > GROUP_PREVIEW && (
                          <button
                            type="button"
                            onClick={() => toggleGroup(group.title)}
                            aria-expanded={expanded.has(group.title)}
                            className="text-[12px] font-semibold tracking-[0.1em] text-ink-soft uppercase underline-offset-4 hover:text-ink hover:underline"
                          >
                            {expanded.has(group.title) ? 'Show fewer' : `Show all ${group.total}`}
                          </button>
                        )}
                      </Reveal>
                    )}

                    <Reveal
                      as="ul"
                      depth
                      className="grid grid-cols-3 gap-[clamp(20px,3vw,32px)] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1"
                    >
                      {group.shown.map((item, i) => (
                        <GalleryTile key={item.key} item={item} onOpen={() => lightbox.open(start + i)} />
                      ))}
                    </Reveal>

                    {active !== ALL && group.total > group.shown.length && (
                      <div className="mt-10 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setPageLimit((limit) => limit + PAGE_SIZE)}
                          className={OUTLINE_BUTTON}
                        >
                          Show more ({group.total - group.shown.length} left)
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {lightbox.index !== null && (
          <Lightbox
            items={visible}
            index={lightbox.index}
            onClose={lightbox.close}
            onNext={lightbox.next}
            onPrev={lightbox.prev}
          />
        )}
      </section>
    </>
  )
}
