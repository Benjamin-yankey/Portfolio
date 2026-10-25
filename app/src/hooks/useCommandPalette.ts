import { useEffect } from 'react'
import { useDisclosure } from './useDisclosure'

export const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)
/** The shortcut as shown on buttons and hints. */
export const SEARCH_SHORTCUT = isMac ? '⌘K' : 'Ctrl K'

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** The search palette's open state, plus ⌘K / Ctrl+K (and "/") from anywhere. */
export function useCommandPalette() {
  const disclosure = useDisclosure()
  const { toggle, open } = disclosure

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        toggle()
      } else if (event.key === '/' && !isTyping(event.target)) {
        event.preventDefault()
        open()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [toggle, open])

  return disclosure
}
