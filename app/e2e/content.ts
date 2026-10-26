import { readFileSync } from 'node:fs'

/**
 * The site's own content, read the same way the build reads it. Tests take
 * names, titles and counts from here rather than hard-coding them, so an
 * edit made in the CMS doesn't break the suite.
 */
function read<T>(file: string): T {
  return JSON.parse(readFileSync(new URL(`../src/content/${file}`, import.meta.url), 'utf8')) as T
}

export const site = read<{ name: string }>('site.json')

export const projects = read<{ items: { slug: string; title: string; categories?: string[] }[] }>('projects.json').items

export const journal = read<{ items: { slug?: string; title: string }[] }>('journal.json').items

const galleryItems = read<{ items: { category?: string; image?: string; video?: string }[] }>('gallery.json').items

/** Gallery tiles per category — an item with both an image and a video is two tiles. */
export function galleryTileCount(category: string): number {
  return galleryItems
    .filter((item) => item.category === category)
    .reduce((count, item) => count + (item.image ? 1 : 0) + (item.video ? 1 : 0), 0)
}

/** Category groups the gallery shows under "All", including "Other" for uncategorized items. */
export const galleryGroupCount =
  new Set(galleryItems.map((item) => item.category).filter(Boolean)).size +
  (galleryItems.some((item) => !item.category) ? 1 : 0)

/** The number shown in a filter chip like "Full-Stack 5". */
export function chipCount(text: string): number {
  return Number(text.match(/(\d+)\s*$/)?.[1] ?? Number.NaN)
}
