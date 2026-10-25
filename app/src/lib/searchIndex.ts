import { githubProjects } from '../data/githubProjects'
import { journalEntries } from '../data/journal'
import { navItems } from '../data/nav'
import { featuredProjects, projects } from '../data/projects'
import { site } from '../data/site'
import { skillUsage } from '../data/skills'
import { projectHref, skillHref } from './routes'

/**
 * Everything the ⌘K palette can find, built from the same data the pages
 * render — so it can't drift out of date with the CMS content.
 */

export const SEARCH_GROUPS = ['Pages', 'Projects', 'Skills', 'Journal', 'Repositories', 'Actions'] as const
export type SearchGroup = (typeof SEARCH_GROUPS)[number]

export type SearchAction =
  | { kind: 'navigate'; to: string }
  | { kind: 'external'; href: string }
  | { kind: 'toggle-theme' }
  | { kind: 'copy'; text: string; done: string }

export interface SearchItem {
  id: string
  group: SearchGroup
  title: string
  subtitle?: string
  /** Extra text that matches but isn't shown. */
  keywords?: string
  action: SearchAction
}

/** Results per group once something is typed. */
const PER_GROUP = 6

const pages: SearchItem[] = navItems.map((item) => ({
  id: `page-${item.path}`,
  group: 'Pages',
  title: item.label,
  action: { kind: 'navigate', to: item.path },
}))

const projectItems: SearchItem[] = projects.map((project) => ({
  id: `project-${project.slug}`,
  group: 'Projects',
  title: project.title,
  subtitle: project.summary,
  keywords: [...project.tags, ...project.stack, ...project.categories].join(' '),
  action: { kind: 'navigate', to: projectHref(project.slug) },
}))

const skillItems: SearchItem[] = skillUsage
  .filter((usage) => usage.projects.length > 0)
  .map((usage) => ({
    id: `skill-${usage.skill}`,
    group: 'Skills',
    title: usage.skill,
    subtitle: `${usage.category} · ${usage.projects.length} ${usage.projects.length === 1 ? 'project' : 'projects'}`,
    action: { kind: 'navigate', to: skillHref(usage.skill) },
  }))

const journalItems: SearchItem[] = journalEntries.map((entry) => ({
  id: `journal-${entry.href}`,
  group: 'Journal',
  title: entry.title,
  subtitle: entry.date,
  keywords: entry.excerpt,
  action: entry.slug ? { kind: 'navigate', to: `/journal/${entry.slug}` } : { kind: 'external', href: entry.href },
}))

const repoItems: SearchItem[] = githubProjects.map((repo) => ({
  id: `repo-${repo.url}`,
  group: 'Repositories',
  title: repo.displayName,
  subtitle: repo.language === '—' ? 'GitHub' : `GitHub · ${repo.language}`,
  keywords: repo.url,
  action: { kind: 'external', href: repo.url },
}))

const actions: SearchItem[] = [
  {
    id: 'action-theme',
    group: 'Actions',
    title: 'Toggle dark mode',
    keywords: 'theme light dark appearance night',
    action: { kind: 'toggle-theme' },
  },
  ...(site.resumeHref
    ? [
        {
          id: 'action-resume',
          group: 'Actions',
          title: 'Download résumé',
          keywords: 'resume cv pdf',
          action: { kind: 'external', href: site.resumeHref },
        } satisfies SearchItem,
      ]
    : []),
  {
    id: 'action-copy-email',
    group: 'Actions',
    title: 'Copy email address',
    subtitle: site.email,
    keywords: 'contact mail',
    action: { kind: 'copy', text: site.email, done: 'Email address copied' },
  },
  {
    id: 'action-github',
    group: 'Actions',
    title: 'Open GitHub profile',
    keywords: 'code repos',
    action: { kind: 'external', href: site.github },
  },
  {
    id: 'action-linkedin',
    group: 'Actions',
    title: 'Open LinkedIn',
    keywords: 'contact profile',
    action: { kind: 'external', href: site.linkedin },
  },
]

const allItems = [...pages, ...projectItems, ...skillItems, ...journalItems, ...repoItems, ...actions]

/** What the palette shows before anything is typed. */
const defaultItems: SearchItem[] = [
  ...pages,
  ...projectItems.filter((item) => featuredProjects.some((project) => item.id === `project-${project.slug}`)),
  ...actions,
]

/**
 * Every typed word has to appear somewhere in the item; titles that start
 * with (then contain) the query rank first. Results keep the group order.
 */
export function searchSite(query: string): SearchItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return defaultItems

  const phrase = terms.join(' ')
  const scored = allItems.flatMap((item) => {
    const haystack = [item.title, item.subtitle, item.keywords].join(' ').toLowerCase()
    if (!terms.every((term) => haystack.includes(term))) return []
    const title = item.title.toLowerCase()
    const score = title.startsWith(phrase) ? 3 : title.includes(phrase) ? 2 : 1
    return [{ item, score }]
  })

  return SEARCH_GROUPS.flatMap((group) =>
    scored
      .filter((entry) => entry.item.group === group)
      .sort((a, b) => b.score - a.score)
      .slice(0, PER_GROUP)
      .map((entry) => entry.item),
  )
}
