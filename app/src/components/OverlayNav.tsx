import type { CSSProperties } from 'react'
import type { NavItem } from '../data/nav'
import { site } from '../data/site'
import { GitHubIcon, LinkedInIcon, EmailIcon } from './icons/SocialIcons'

interface OverlayNavProps {
  isOpen: boolean
  navItems: NavItem[]
  activeId: string
  onNavigate: (target: string) => void
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
export function OverlayNav({ isOpen, navItems, activeId, onNavigate }: Readonly<OverlayNavProps>) {
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
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-cream sm:gap-10',
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      ].join(' ')}
    >
      <ul className="text-center">
        {navItems.map((item, index) => (
          <li key={item.target} className="overflow-hidden">
            <a
              href={`#${item.target}`}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(item.target)
              }}
              className={[
                'block py-[0.06em] font-serif text-[clamp(2.4rem,8vw,5.2rem)] leading-[1.08] font-normal transition-transform duration-700 ease-editorial',
                activeId === item.target ? 'text-ink' : 'text-muted-faint',
                isOpen ? 'translate-y-0' : 'translate-y-[110%]',
              ].join(' ')}
              style={{ transitionDelay: isOpen ? `${index * 60 + 60}ms` : '0ms' }}
            >
              {item.label}
            </a>
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
