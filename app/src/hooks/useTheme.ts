import { useSyncExternalStore } from 'react'
import { getTheme, readToken, subscribeTheme, toggleTheme } from '../lib/theme'

export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme)
  return { theme, toggle: toggleTheme }
}

/**
 * A color token's current value, re-read whenever the theme changes — for
 * the WebGL scenes, which take colors as values rather than CSS.
 */
export function useThemeColor(token: string): string {
  // Subscribing re-renders on a theme change, which re-reads the token. The
  // value comes from CSS so index.css stays the single source of truth.
  useTheme()
  return readToken(token)
}
