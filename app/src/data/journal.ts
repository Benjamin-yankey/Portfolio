import content from '../content/journal.json'

export interface JournalEntry {
  date: string
  title: string
  /** Set when the write-up is published on the site, at /journal/<slug>,
   *  from src/content/journal/<slug>.md. Without it the entry links out. */
  slug?: string
  excerpt: string
  /** Where the write-up originally lives (usually GitHub). */
  href: string
  image?: string
}

export const journalEntries: JournalEntry[] = content.items

/** Entries with an on-site article, in list order. */
export const journalArticles = journalEntries.filter((entry) => entry.slug)

export function findArticle(slug: string | undefined): JournalEntry | undefined {
  return journalArticles.find((entry) => entry.slug === slug)
}

// Loaded on demand, so each article is its own small chunk.
const articleSources = import.meta.glob<string>('../content/journal/*.md', { query: '?raw', import: 'default' })

/** The article's markdown, or null if there's no file for it. */
export async function loadArticle(slug: string): Promise<string | null> {
  const load = articleSources[`../content/journal/${slug}.md`]
  if (!load) return null
  // Articles edited in the CMS gain YAML front matter; the body is what follows it.
  return (await load()).replace(/^---\n[\s\S]*?\n---\n/, '')
}
