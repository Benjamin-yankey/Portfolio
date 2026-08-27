import content from '../content/journal.json'

export interface JournalEntry {
  date: string
  title: string
  excerpt: string
  href: string
}

export const journalEntries: JournalEntry[] = content.items
