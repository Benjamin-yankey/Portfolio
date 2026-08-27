import { galleryItems } from '../data/gallery'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'
import { Tilt3D } from './Tilt3D'

export function Gallery() {
  const items = galleryItems.filter((item) => item.image || item.video)

  return (
    <section className="section">
      <div className="container-page">
        <SectionHeading title="Gallery" index="05 — Gallery" />

        {items.length === 0 ? (
          <p className="py-[clamp(28px,3.6vw,40px)] text-[0.96rem] text-muted">
            No items yet — check back later.
          </p>
        ) : (
          <Reveal
            as="ul"
            depth
            className="grid grid-cols-3 gap-[clamp(20px,3vw,32px)] max-[860px]:grid-cols-2 max-[560px]:grid-cols-1"
          >
            {items.map((item) => (
              <li key={item.title}>
                <Tilt3D
                  maxTilt={4}
                  lift={12}
                  className="block"
                  planeClassName="overflow-hidden rounded-2xl border border-line"
                >
                  {item.video ? (
                    <video
                      src={item.video}
                      controls
                      playsInline
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                </Tilt3D>
                <p className="mt-3 font-serif text-[1.05rem]">{item.title}</p>
                {item.caption && <p className="mt-1 text-[0.9rem] text-muted">{item.caption}</p>}
              </li>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  )
}
