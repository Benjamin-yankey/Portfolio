import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { navItems } from '../data/nav'
import { site } from '../data/site'
import { useOverlayNav } from '../hooks/useOverlayNav'
import { TopBar } from './TopBar'
import { OverlayNav } from './OverlayNav'
import { Footer } from './Footer'

/** Context handed to whichever page is routed into the `<Outlet>`. Only Hero
 *  currently reads it (for the badge's "open nav" button and its in-panel
 *  route links) — every other page is a plain route with no chrome to control. */
export interface PageContext {
  openMenu: () => void
  goTo: (path: string) => void
}

/**
 * Shared page chrome: the paper-grain overlay, fixed top bar, full-screen
 * nav overlay, and footer — everything that used to wrap all six sections
 * in one scrolling document. Now each route renders one page into
 * `<Outlet>` and this is the only thing that persists across navigations.
 */
export function Layout() {
  const { isOpen, open, toggle, close } = useOverlayNav()
  const location = useLocation()
  const navigate = useNavigate()

  // A route change is a new page, not a scroll position carried over from
  // the last one.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'instant' })
  }, [location.pathname])

  useEffect(() => {
    const current = navItems.find((item) => item.path === location.pathname)
    document.title = current && current.path !== '/' ? `${current.label} — ${site.wordmark}` : `${site.wordmark} — ${site.role}`
  }, [location.pathname])

  function handleNavigate(path: string) {
    if (path === location.pathname) {
      close()
      return
    }
    close()
    // Same 300ms delay as before: let the overlay finish closing before the
    // route changes, so the two transitions don't fight each other.
    window.setTimeout(() => navigate(path), 300)
  }

  return (
    <>
      {/* Subtle paper-grain texture over the whole page, matching the
          source's `body::before` overlay. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2] opacity-50 mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.03 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      <TopBar isOpen={isOpen} onToggle={toggle} />
      <OverlayNav
        isOpen={isOpen}
        navItems={navItems}
        activePath={location.pathname}
        onNavigate={handleNavigate}
      />

      <main>
        <Outlet context={{ openMenu: open, goTo: navigate } satisfies PageContext} />
      </main>

      <Footer />
    </>
  )
}
