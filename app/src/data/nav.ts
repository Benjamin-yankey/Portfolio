export interface NavItem {
  label: string
  path: string
}

/** Order also drives the nav overlay order and the route list in App.
 *  Home lives at /home rather than / — the root is the entry/splash page,
 *  reached only once before the site proper. */
export const navItems: NavItem[] = [
  { label: 'Home', path: '/home' },
  { label: 'Projects', path: '/projects' },
  { label: 'Skills', path: '/skills' },
  { label: 'Experience', path: '/experience' },
  { label: 'Journal', path: '/journal' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Contact', path: '/contact' },
]
