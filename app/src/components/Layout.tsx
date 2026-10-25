import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { navItems } from '../data/nav'
import { site } from '../data/site'
import { useCommandPalette } from '../hooks/useCommandPalette'
import { useDisclosure } from '../hooks/useDisclosure'
import { TopBar } from './TopBar'
import { OverlayNav } from './OverlayNav'
import { Footer } from './Footer'
import { PaperGrain } from './PaperGrain'
import { ChatBot } from './ChatBot'
import { CommandPalette } from './CommandPalette'

/**
 * Shared page chrome: the paper-grain overlay, fixed top bar, full-screen
 * nav overlay, and footer — everything that used to wrap all six sections
 * in one scrolling document. Now each route renders one page into
 * `<Outlet>` and this is the only thing that persists across navigations.
 */
export function Layout() {
  const { isOpen, toggle, close } = useDisclosure()
  const search = useCommandPalette()
  const location = useLocation()
  const navigate = useNavigate()

  // A route change is a new page, not a scroll position carried over from
  // the last one.
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'instant' })
  }, [location.pathname])

  // Nested pages (/projects/:slug) belong to their parent section for the
  // nav's active state.
  const section = navItems.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`),
  )

  useEffect(() => {
    const current = navItems.find((item) => item.path === location.pathname)
    // Nested pages set their own title. Effects run child-first, so setting
    // one here would overwrite it.
    if (!current) return
    // The hub route (Home) gets the site's "front door" title; every other
    // page gets its own name ahead of the wordmark.
    document.title =
      current.path !== navItems[0].path
        ? `${current.label} — ${site.wordmark}`
        : `${site.wordmark} — ${site.role}`
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
      <PaperGrain />

      <TopBar
        isOpen={isOpen}
        onToggle={toggle}
        onSearch={() => {
          // One full-screen layer at a time: both lock body scroll.
          close()
          search.open()
        }}
      />
      <OverlayNav
        isOpen={isOpen}
        navItems={navItems}
        activePath={section?.path ?? location.pathname}
        onNavigate={handleNavigate}
      />

      <main>
        <Outlet />
      </main>

      <Footer />
      <ChatBot />
      <CommandPalette isOpen={search.isOpen} onClose={search.close} />
    </>
  )
}
