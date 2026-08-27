import { useCallback, useEffect, useState } from 'react'

/**
 * Index-based sibling to `useOverlayNav`: same open/close/Escape/scroll-lock
 * shape, extended with wrapping Prev/Next over `count` items (the *filtered*
 * count — the caller passes however many items are currently visible, so
 * navigation always stays inside what's actually on screen).
 */
export function useLightbox(count: number) {
  const [index, setIndex] = useState<number | null>(null)

  const open = useCallback((i: number) => setIndex(i), [])
  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(() => {
    setIndex((current) => (current === null || count === 0 ? current : (current + 1) % count))
  }, [count])
  const prev = useCallback(() => {
    setIndex((current) => (current === null || count === 0 ? current : (current - 1 + count) % count))
  }, [count])

  useEffect(() => {
    if (index === null) return

    document.body.classList.add('overflow-hidden')

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [index, close, next, prev])

  return { index, open, close, next, prev }
}
