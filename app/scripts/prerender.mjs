// Runs after `vite build`. Writes one HTML file per route into dist/, each
// with its own <title>, description, canonical URL and link-preview tags.
// Link previewers (LinkedIn, Slack, iMessage) and many crawlers don't run
// JavaScript, so without this every shared link showed the same generic
// card. Only <head> (and a <noscript> fallback) differs per page — the app
// still renders the body. Also writes sitemap.xml and the journal RSS feed.
//
// SITE_URL sets the absolute host for canonical and preview URLs (default:
// GitHub Pages; the Cloudflare build passes its own).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { navItems } from '../src/data/nav.ts'

const SITE_URL = (process.env.SITE_URL || 'https://benjamin-yankey.github.io').replace(/\/$/, '')
const BASE = '/Portfolio/'
const ROOT = `${SITE_URL}${BASE}`

const content = (file) => JSON.parse(readFileSync(new URL(`../src/content/${file}`, import.meta.url), 'utf8'))
const site = content('site.json')
const projects = content('projects.json').items
const journal = content('journal.json').items
const template = readFileSync('dist/index.html', 'utf8')

const escapeHtml = (text) =>
  String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

/** Clips to a search-snippet length at a word boundary. */
function clip(text, max = 160) {
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max - 1))}…`
}

/** A file in public/ (as a /Portfolio/… path) as an absolute URL, if it exists. */
function publicUrl(path) {
  return path && existsSync(`public/${path.replace(BASE, '')}`) ? `${SITE_URL}${path}` : null
}

const DEFAULT_IMAGE = `${SITE_URL}${BASE}og/site.jpg`

// One line per section for search results and previews.
const SECTION_DESCRIPTIONS = {
  '/home': site.bio,
  '/projects': 'Full-stack products and the cloud infrastructure that runs them: problem, approach, stack and code for each project.',
  '/skills': `The languages, frameworks, cloud services and tools ${site.name} works with, and the projects that use each one.`,
  '/experience': `${site.name}'s roles as a DevOps engineer and software developer at Amalitech, and his Computer Science degree from KNUST.`,
  '/journal': 'Write-ups from the projects: architecture decisions, runbooks, audits and incident reports.',
  '/gallery': 'Every project on GitHub in pictures: live screens, architecture diagrams and pipeline runs.',
  '/contact': site.contactSub,
  '/resume': `A one-page résumé for ${site.name}, ${site.role}.`,
}

const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  url: ROOT,
  email: `mailto:${site.email}`,
  image: `${SITE_URL}${site.portrait}`,
  address: site.location ? { '@type': 'PostalAddress', addressLocality: site.location.split('·')[0].trim() } : undefined,
  sameAs: [site.github, site.linkedin],
}

const pages = [
  { path: '', title: `${site.name} — ${site.role}`, description: site.bio, jsonLd: person },
  ...navItems.map((item) => ({
    path: `${item.path.slice(1)}/`,
    title: item.path === '/home' ? `${site.name} — ${site.role}` : `${item.label} — ${site.name}`,
    description: SECTION_DESCRIPTIONS[item.path] ?? site.bio,
    image: item.path === '/journal' ? publicUrl(`${BASE}og/journal.jpg`) : undefined,
    jsonLd: item.path === '/home' || item.path === '/resume' ? person : undefined,
  })),
  ...projects.map((project) => ({
    path: `projects/${project.slug}/`,
    title: `${project.title} — ${site.name}`,
    description: `${project.summary} ${project.keyDetail}`,
    image: publicUrl(`${BASE}og/projects/${project.slug}.jpg`) ?? publicUrl(project.image),
    type: 'article',
  })),
  ...journal
    .filter((entry) => entry.slug)
    .map((entry) => ({
      path: `journal/${entry.slug}/`,
      title: `${entry.title} — ${site.name}`,
      description: entry.excerpt,
      image: publicUrl(`${BASE}og/journal.jpg`),
      type: 'article',
    })),
]

function headTags(page) {
  const url = `${ROOT}${page.path}`
  const image = page.image ?? DEFAULT_IMAGE
  const description = escapeHtml(clip(page.description))
  const title = escapeHtml(page.title)
  const tags = [
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${escapeHtml(site.name)} — Journal" href="${ROOT}journal/rss.xml" />`,
    `<meta property="og:type" content="${page.type ?? 'website'}" />`,
    `<meta property="og:site_name" content="${escapeHtml(site.name)}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
  if (page.jsonLd) {
    // `<` escaped so the JSON can't close the script tag early.
    tags.push(`<script type="application/ld+json">${JSON.stringify(page.jsonLd).replaceAll('<', '\\u003c')}</script>`)
  }
  return tags.map((tag) => `    ${tag}`).join('\n')
}

/** What a visitor without JavaScript (or a crawler that doesn't run it) sees. */
function noscript(page) {
  const links = navItems.map((item) => `<a href="${BASE}${item.path.slice(1)}/">${escapeHtml(item.label)}</a>`).join(' · ')
  return `<noscript><main style="max-width:680px;margin:64px auto;padding:0 24px;font-family:system-ui,sans-serif;line-height:1.6"><h1>${escapeHtml(page.title)}</h1><p>${escapeHtml(page.description)}</p><p>${links}</p></main></noscript>`
}

function render(page) {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${escapeHtml(clip(page.description))}" />`)
    .replace(/\s*<\/head>/, `\n${headTags(page)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${noscript(page)}</div>`)
}

for (const page of pages) {
  const dir = `dist/${page.path}`
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}index.html`, render(page))
}

const today = new Date().toISOString().slice(0, 10)
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url><loc>${ROOT}${page.path}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`,
)

// Journal dates are "Jun 2026"; RSS wants a full date, so use the 1st.
const rssDate = (date) => new Date(`1 ${date} 12:00 UTC`).toUTCString()
const items = journal.map((entry) => {
  const link = entry.slug ? `${ROOT}journal/${entry.slug}/` : entry.href
  return `    <item>
      <title>${escapeHtml(entry.title)}</title>
      <link>${escapeHtml(link)}</link>
      <guid isPermaLink="true">${escapeHtml(link)}</guid>
      <pubDate>${rssDate(entry.date)}</pubDate>
      <description>${escapeHtml(entry.excerpt)}</description>
    </item>`
})
mkdirSync('dist/journal', { recursive: true })
writeFileSync(
  'dist/journal/rss.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(site.name)} — Journal</title>
    <link>${ROOT}journal/</link>
    <description>Write-ups from ${escapeHtml(site.name)}'s full-stack and DevOps projects.</description>
    <language>en</language>
    <atom:link href="${ROOT}journal/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`,
)

console.log(`Pre-rendered ${pages.length} pages, sitemap.xml and journal/rss.xml for ${ROOT}`)
