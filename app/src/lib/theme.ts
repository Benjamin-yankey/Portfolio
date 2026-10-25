/**
 * Light/dark theme as a tiny external store. The inline script in
 * index.html sets `data-theme` on <html> before first paint (so there's no
 * flash of the wrong theme); this module picks up from there, persists an
 * explicit choice, and follows the system setting until one is made.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'
const systemQuery = window.matchMedia('(prefers-color-scheme: dark)')

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    // Storage can throw in private windows or with site data blocked.
    return null
  }
}

let current: Theme =
  (document.documentElement.dataset.theme as Theme | undefined) ??
  storedTheme() ??
  (systemQuery.matches ? 'dark' : 'light')

const listeners = new Set<() => void>()

function apply(theme: Theme) {
  current = theme
  document.documentElement.dataset.theme = theme
  // Browser UI (mobile address bar) matches the page background.
  const background = getComputedStyle(document.documentElement).getPropertyValue('--color-cream').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
  listeners.forEach((listener) => listener())
}

systemQuery.addEventListener('change', (event) => {
  if (!storedTheme()) apply(event.matches ? 'dark' : 'light')
})

export function getTheme(): Theme {
  return current
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Not persisted, but still applied for this visit.
  }
  apply(theme)
}

export function toggleTheme() {
  setTheme(current === 'dark' ? 'light' : 'dark')
}

export function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** A design token's current value, e.g. readToken('--color-ink'). */
export function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
