import { githubProjects } from './githubProjects'

/** Pulled from the public GitHub API for github.com/Benjamin-yankey and
 *  baked in like `githubProjects` — same reasoning: no client-side fetch,
 *  no rate limit, works offline. Update by re-querying
 *  `api.github.com/users/Benjamin-yankey` (and `/repos` for the star sum)
 *  when the numbers move. */
export const githubStats = {
  username: 'Benjamin-yankey',
  repositories: githubProjects.length,
  followers: 1,
  starred: 0,
  memberSince: 2022,
}
