/** URL builders for in-site links, so query-string shapes live in one place. */

export function projectHref(slug: string): string {
  return `/projects/${slug}`
}

/** The Projects page filtered to the projects that use one skill. */
export function skillHref(skill: string): string {
  return `/projects?skill=${encodeURIComponent(skill)}`
}
