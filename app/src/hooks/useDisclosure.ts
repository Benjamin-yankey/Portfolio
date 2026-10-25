import { useCallback, useEffect, useState } from 'react'

/**
 * Open/close state for a full-screen layer (the overlay nav, the search
 * palette): Escape-to-close and locking body scroll while open — the same
 * behavior as the original vanilla-JS `nav-open` / `nav-open-lock` body
 * classes.
 */
export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  useEffect(() => {
    if (!isOpen) return

    document.body.classList.add('overflow-hidden')

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('overflow-hidden')
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close])

  return { isOpen, open, close, toggle }
}
