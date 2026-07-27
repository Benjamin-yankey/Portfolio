export interface NavItem {
  label: string
  path: string
}

/** Order also drives the nav overlay order and the route list in App. */
export const navItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/projects' },
  { label: 'Skills', path: '/skills' },
  { label: 'Experience', path: '/experience' },
  { label: 'Journal', path: '/journal' },
  { label: 'Contact', path: '/contact' },
]
