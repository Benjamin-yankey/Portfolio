import { useEffect, useState } from 'react'

/**
 * Highlights whichever section is currently "current" as the user scrolls.
 * Same rootMargin trick as the original vanilla-JS version: shrink the
 * observed viewport by 45% on top and bottom so the "active" section is
 * whichever one crosses the middle of the screen.
 */
export function useScrollSpy(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? '')

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(',')])

  return activeId
}
