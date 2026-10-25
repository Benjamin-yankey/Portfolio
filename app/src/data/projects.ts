import content from '../content/projects.json'
import { galleryItems, toGalleryMedia, type GalleryMedia } from './gallery'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  num: string
  /** URL segment for the project's own page: /projects/<slug>. */
  slug: string
  title: string
  /** Drives the filter chips on the Projects page. */
  categories: string[]
  /** Featured projects are the ones shown on the Home page. */
  featured?: boolean
  summary: string
  /** The handful of headline tools shown as pills in lists. */
  tags: string[]
  /** Everything the project uses — shown on its page, and what links skills
   *  to projects (together with `tags`). */
  stack: string[]
  problem: string
  solution: string
  role: string
  keyDetail: string
  image?: string
  video?: string
  /** Code, live site, docs — shown as buttons on the project page. */
  links?: ProjectLink[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '')
}

// A project added through the CMS without a slug or category still gets a
// working page and still appears under "All".
export const projects: Project[] = content.items.map((item) => ({
  ...item,
  slug: item.slug || slugify(item.title),
  categories: item.categories ?? [],
  stack: item.stack ?? [],
}))

/** Category order follows first appearance, so the CMS controls it. */
export const projectCategories: string[] = Array.from(
  new Set(projects.flatMap((project) => project.categories)),
)

export function findProject(slug: string | undefined): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

/** The flagged projects, or the first three if none are flagged. */
export const featuredProjects: Project[] = (() => {
  const flagged = projects.filter((project) => project.featured)
  return flagged.length > 0 ? flagged : projects.slice(0, 3)
})()

/**
 * Gallery media from the same repos as the project, matched on the gallery
 * item's `link` — so a screenshot added to the gallery for a repo shows up on
 * its project page without a second entry. The project's own hero image or
 * video is left out, since the page already shows it at the top.
 */
export function galleryForProject(project: Project): GalleryMedia[] {
  const hrefs = new Set((project.links ?? []).map((link) => link.href))
  const related = galleryItems.filter((item) => item.link && hrefs.has(item.link))
  return toGalleryMedia(related).filter(
    (media) => media.src !== project.image && media.src !== project.video,
  )
}
