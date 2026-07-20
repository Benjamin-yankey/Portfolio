export interface NavItem {
  label: string
  target: string
}

/** Order also drives the section render order in App and the scroll-spy list. */
export const navItems: NavItem[] = [
  { label: 'Home', target: 'home' },
  { label: 'Projects', target: 'projects' },
  { label: 'Skills', target: 'skills' },
  { label: 'Experience', target: 'experience' },
  { label: 'Journal', target: 'journal' },
  { label: 'Contact', target: 'contact' },
]
