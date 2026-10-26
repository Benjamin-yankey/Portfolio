import { chipCount, projects } from './content'
import { expect, test } from './fixtures'

const rows = 'li:has(> a[href*="/projects/"])'

test('category and skill filters narrow the list and live in the URL', async ({ page }) => {
  await page.goto('projects')
  await expect(page.locator(rows)).toHaveCount(projects.length)

  // Each chip's count must match what the list then shows.
  const fullStack = page.getByRole('button', { name: /^Full-Stack/ })
  const expected = chipCount(await fullStack.innerText())
  await fullStack.click()
  await expect(page).toHaveURL(/category=Full-Stack/)
  await expect(page.locator(rows)).toHaveCount(expected)

  await page.goto('projects?skill=Terraform&category=Full-Stack')
  const narrowed = chipCount(await page.getByRole('button', { name: /^Full-Stack/ }).innerText())
  await expect(page.locator(rows)).toHaveCount(narrowed)
  await page.getByRole('button', { name: /Using Terraform/ }).click()
  await expect(page).not.toHaveURL(/skill=/)
  await expect(page.locator(rows)).toHaveCount(expected)
})

test('a project page has the write-up and stack links into the filtered list', async ({ page }) => {
  const [project] = projects
  await page.goto(`projects/${project.slug}`)
  await expect(page.getByRole('heading', { level: 1, name: project.title })).toBeVisible()
  for (const section of ['Problem', 'Solution', 'Role']) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible()
  }

  // The first tool that links to a skill filter leads back to a list that
  // includes this project.
  await page.locator('aside a').first().click()
  await expect(page).toHaveURL(/skill=/)
  await expect(page.locator(`${rows} a[href$="/projects/${project.slug}"]`)).toHaveCount(1)
})

test('project gallery items open in the lightbox', async ({ page }) => {
  await page.goto(`projects/${projects[0].slug}`)
  // count() doesn't wait, so let the page render before checking for a gallery.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const gallery = page.locator('section', { has: page.getByRole('heading', { name: 'From the gallery' }) })
  test.skip((await gallery.count()) === 0, 'this project has no gallery items')
  await gallery.getByRole('button').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})

test('next and previous links walk through the projects', async ({ page }) => {
  test.skip(projects.length < 2, 'needs two projects')
  await page.goto(`projects/${projects[0].slug}`)
  await page.getByRole('navigation', { name: 'More projects' }).getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(new RegExp(`/projects/${projects[1].slug}$`))
})

test('an unknown project goes back to the list', async ({ page }) => {
  await page.goto('projects/not-a-project')
  await expect(page).toHaveURL(/\/projects$/)
})
