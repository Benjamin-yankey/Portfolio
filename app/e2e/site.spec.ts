import { journal, projects, site } from './content'
import { expect, test } from './fixtures'

const PAGES = [
  { path: 'home', heading: site.name },
  { path: 'projects', heading: 'Selected work' },
  { path: 'skills', heading: 'Skills & tools' },
  { path: 'experience', heading: 'Experience' },
  { path: 'journal', heading: 'Journal' },
  { path: 'gallery', heading: 'Gallery' },
  { path: 'contact', heading: "Let's build something great" },
  { path: 'resume', heading: site.name },
]

for (const { path, heading } of PAGES) {
  test(`${path} renders`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: heading, exact: true }).first()).toBeVisible()
  })
}

test('the entry page leads into the site', async ({ page }) => {
  await page.goto('')
  await page.getByRole('link', { name: /Enter the site/ }).click()
  await expect(page).toHaveURL(/\/home$/)
})

test('unknown addresses show the not-found page', async ({ page }) => {
  await page.goto('no-such-page')
  await expect(page.getByRole('heading', { name: "This page doesn't exist." })).toBeVisible()
  await expect(page).toHaveTitle(/Page not found/)
})

test('each route is pre-rendered with its own title and preview tags', async ({ request }) => {
  const [project] = projects
  const html = await (await request.get(`projects/${project.slug}/`)).text()
  // The pre-renderer escapes &, < and > in titles.
  const title = `${project.title} — ${site.name}`.replaceAll('&', '&amp;')
  expect(html).toContain(`<title>${title}</title>`)
  expect(html).toMatch(/<meta property="og:image" content="https?:\/\/[^"]+"/)
  expect(html).toContain(`/Portfolio/projects/${project.slug}/" />`)
})

test('sitemap and RSS feed are published', async ({ request }) => {
  const sitemap = await (await request.get('sitemap.xml')).text()
  for (const project of projects) expect(sitemap).toContain(`/Portfolio/projects/${project.slug}/</loc>`)
  const rss = await (await request.get('journal/rss.xml')).text()
  expect(rss).toContain('<rss version="2.0"')
  expect(rss.match(/<item>/g)?.length).toBe(journal.length)
})
