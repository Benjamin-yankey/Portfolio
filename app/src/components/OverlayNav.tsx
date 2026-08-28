import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import type { NavItem } from '../data/nav'
import { site } from '../data/site'
import { GitHubIcon, LinkedInIcon, EmailIcon } from './icons/SocialIcons'

interface OverlayNavProps {
  isOpen: boolean
  navItems: NavItem[]
  activePath: string
  onNavigate: (path: string) => void
}

const EASE = 'cubic-bezier(.22,.61,.36,1)'

/**
 * Full-screen overlay navigation with a staggered line-by-line reveal.
 *
 * The `visibility` toggle is deliberately asymmetric, matching the source:
 * opening flips to `visible` instantly so the panel is interactive right
 * away, while closing keeps it `visible` (and therefore focusable/clickable)
 * until the fade/slide transition finishes, only then switching to hidden.
 * That's awkward to express with paired Tailwind utility classes, so it's
 * set directly via inline style.
 */
export function OverlayNav({ isOpen, navItems, activePath, onNavigate }: Readonly<OverlayNavProps>) {
  const navStyle: CSSProperties = {
    transition: `opacity .55s ${EASE}, transform .55s ${EASE}, visibility 0s linear ${isOpen ? '0s' : '.55s'}`,
    visibility: isOpen ? 'visible' : 'hidden',
  }

  return (
    <nav
      id="overlay-nav"
      aria-hidden={!isOpen}
      style={navStyle}
      className={[
        // `safe center` (with a plain `center` fallback) plus `overflow-y-auto`
        // means that if the item list is ever taller than the viewport — a
        // short window, a couple more nav items down the line — it scrolls
        // instead of letting the centering push items above y=0 with no way
        // to reach them.
        // Top padding clears the fixed TopBar (z-60, ~100-108px tall) so a
        // centered/scrolled item never renders underneath its opaque bar.
        'fixed inset-0 z-50 flex flex-col items-center gap-8 overflow-y-auto bg-cream pt-[112px] pb-8 sm:gap-10 sm:pt-[124px]',
        'justify-center-safe',
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      ].join(' ')}
    >
      <ul className="text-center">
        {navItems.map((item, index) => (
          <li key={item.path} className="overflow-hidden">
            <Link
              to={item.path}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.path)
              }}
              className={[
                // Bounded by vh as well as vw: at 7 items, a pure vw-based
                // size fits wide-but-short windows (common on laptops) only
                // by accident. min() picks whichever axis is tighter, so the
                // list still fits without scrolling on ordinary screens.
                'block py-[0.06em] font-serif text-[clamp(1.75rem,min(8vw,8.5vh),5.2rem)] leading-[1.08] font-normal transition-transform duration-700 ease-editorial',
                activePath === item.path ? 'text-ink' : 'text-muted-faint',
                isOpen ? 'translate-y-0' : 'translate-y-[110%]',
              ].join(' ')}
              style={{ transitionDelay: isOpen ? `${index * 60 + 60}ms` : '0ms' }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="h-px w-11 bg-line" />

      <div className="flex gap-[22px]">
        <a
          href={site.github}
          aria-label="GitHub"
          className="text-muted transition-all duration-300 ease-editorial hover:-translate-y-0.5 hover:text-ink"
        >
          <GitHubIcon />
        </a>
        <a
          href={site.linkedin}
          aria-label="LinkedIn"
          className="text-muted transition-all duration-300 ease-editorial hover:-translate-y-0.5 hover:text-ink"
        >
          <LinkedInIcon />
        </a>
        <a
          href={`mailto:${site.email}`}
          aria-label="Email"
          className="text-muted transition-all duration-300 ease-editorial hover:-translate-y-0.5 hover:text-ink"
        >
          <EmailIcon />
        </a>
      </div>
    </nav>
  )
}
