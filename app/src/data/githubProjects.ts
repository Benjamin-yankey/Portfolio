import content from '../content/github-projects.json'

export interface GithubProject {
  displayName: string
  language: string
  url: string
}

/** Every non-fork repo on github.com/Benjamin-yankey, pulled via the public
 *  GitHub API. Baked in as static data rather than fetched client-side, so
 *  this section works offline, loads instantly, and never trips GitHub's
 *  60-req/hr unauthenticated rate limit for visitors. Editable via /admin. */
export const githubProjects: GithubProject[] = content.items
