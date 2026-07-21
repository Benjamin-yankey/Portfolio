import { navItems } from './data/nav'
import { scrollToSection } from './lib/scrollToSection'
import { useOverlayNav } from './hooks/useOverlayNav'
import { useScrollSpy } from './hooks/useScrollSpy'
import { TopBar } from './components/TopBar'
import { OverlayNav } from './components/OverlayNav'
import { Hero } from './components/Hero'
import { Projects } from './components/projects/Projects'
import { Skills } from './components/Skills'
import { Experience } from './components/Experience'
import { Journal } from './components/Journal'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

const SECTION_IDS = navItems.map((item) => item.target)

function App() {
  const { isOpen, open, toggle, close } = useOverlayNav()
  const activeId = useScrollSpy(SECTION_IDS)

  function handleNavigate(target: string) {
    close()
    // Same 300ms delay as the source: let the overlay finish closing before
    // the page scrolls, so the motion doesn't fight itself.
    window.setTimeout(() => scrollToSection(target), 300)
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
        activeId={activeId}
        onNavigate={handleNavigate}
      />

      <main>
        <Hero onOpenMenu={open} onNavigate={scrollToSection} />
        <Projects />
        <Skills />
        <Experience />
        <Journal />
        <Contact />
      </main>

      <Footer />
    </>
  )
}

export default App
