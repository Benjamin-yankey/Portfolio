import content from '../content/github-stats.json'
import { githubProjects } from './githubProjects'

/** `followers`/`starred`/`memberSince` are pulled from the public GitHub API
 *  for github.com/Benjamin-yankey and editable via /admin. `repositories`
 *  is deliberately not CMS-managed — it's derived from `githubProjects`
 *  so it can't drift out of sync with the actual repo list. */
export const githubStats = {
  ...content,
  repositories: githubProjects.length,
}
