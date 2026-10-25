// Refreshes src/content/github-projects.json and github-stats.json from the
// public GitHub API, so the repo village and stats don't go stale. Existing
// display names are kept; new repos get one made from the repo name; repos
// that were deleted or turned into forks drop out. Runs weekly in
// .github/workflows/sync-github.yml.
//   node scripts/sync-github.mjs [--dry-run]
// Uses GITHUB_TOKEN when set (higher rate limit); works without it.
import { readFileSync, writeFileSync } from 'node:fs'

const DRY_RUN = process.argv.includes('--dry-run')
const PROJECTS_FILE = new URL('../src/content/github-projects.json', import.meta.url)
const STATS_FILE = new URL('../src/content/github-stats.json', import.meta.url)

const stats = JSON.parse(readFileSync(STATS_FILE, 'utf8'))
const current = JSON.parse(readFileSync(PROJECTS_FILE, 'utf8'))
const user = stats.username

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-sync' }
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

async function github(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers })
  if (!response.ok) throw new Error(`GitHub ${path} → ${response.status} ${await response.text()}`)
  return response
}

// GitHub reports Terraform as HCL; the site has always said Terraform.
const LANGUAGE_NAMES = { HCL: 'Terraform' }

function displayName(repoName) {
  return repoName
    .replaceAll(/[-_]+/g, ' ')
    .trim()
    .replaceAll(/\b[a-z]/g, (letter) => letter.toUpperCase())
}

const profile = await (await github(`/users/${user}`)).json()
const repos = []
for (let page = 1; ; page++) {
  const batch = await (await github(`/users/${user}/repos?type=owner&sort=pushed&per_page=100&page=${page}`)).json()
  repos.push(...batch)
  if (batch.length < 100) break
}

// How many repos the user has starred: ask for one per page and read the
// last page number from the Link header.
const starredLink = (await github(`/users/${user}/starred?per_page=1`)).headers.get('link') ?? ''
const starred = Number(starredLink.match(/page=(\d+)>; rel="last"/)?.[1] ?? 0)

const known = new Map(current.items.map((item) => [item.url.toLowerCase(), item]))
const items = repos
  // The profile README repo isn't a project.
  .filter((repo) => !repo.fork && repo.name.toLowerCase() !== user.toLowerCase())
  .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
  .map((repo) => {
    const existing = known.get(repo.html_url.toLowerCase())
    return {
      displayName: existing?.displayName ?? displayName(repo.name),
      language: repo.language ? (LANGUAGE_NAMES[repo.language] ?? repo.language) : '—',
      url: repo.html_url,
    }
  })

const nextStats = {
  ...stats,
  followers: profile.followers,
  starred,
  memberSince: Number(profile.created_at.slice(0, 4)),
}

const changes = []
const urls = new Set(items.map((item) => item.url.toLowerCase()))
for (const item of items) if (!known.has(item.url.toLowerCase())) changes.push(`+ ${item.displayName}`)
for (const item of current.items) if (!urls.has(item.url.toLowerCase())) changes.push(`- ${item.displayName}`)
for (const key of ['followers', 'starred', 'memberSince']) {
  if (stats[key] !== nextStats[key]) changes.push(`${key}: ${stats[key]} → ${nextStats[key]}`)
}
const reordered = JSON.stringify(items) !== JSON.stringify(current.items)

if (changes.length === 0 && !reordered) {
  console.log('GitHub data is up to date.')
} else {
  console.log(changes.length ? changes.join('\n') : 'Order or languages changed.')
  if (!DRY_RUN) {
    writeFileSync(PROJECTS_FILE, `${JSON.stringify({ ...current, items }, null, 2)}\n`)
    writeFileSync(STATS_FILE, `${JSON.stringify(nextStats, null, 2)}\n`)
  }
}
