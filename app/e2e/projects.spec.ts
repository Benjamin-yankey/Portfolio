import { expect, test } from './fixtures'

const rows = 'li:has(> a[href*="/projects/"])'

test('category and skill filters narrow the list and live in the URL', async ({ page }) => {
  await page.goto('projects')
  await expect(page.locator(rows)).toHaveCount(9)

  await page.getByRole('button', { name: /^Full-Stack/ }).click()
  await expect(page).toHaveURL(/category=Full-Stack/)
  await expect(page.locator(rows)).toHaveCount(5)

  await page.goto('projects?skill=Terraform&category=Full-Stack')
  await expect(page.locator(rows)).toHaveCount(3)
  await page.getByRole('button', { name: /Using Terraform/ }).click()
  await expect(page).not.toHaveURL(/skill=/)
  await expect(page.locator(rows)).toHaveCount(5)
})

test('a project page has the write-up, stack links, gallery and next project', async ({ page }) => {
  await page.goto('projects/gitops-mail')
  await expect(page.getByRole('heading', { level: 1, name: 'GitOps Mail System' })).toBeVisible()
  await expect(page).toHaveTitle(/^GitOps Mail System/)
  for (const section of ['Problem', 'Solution', 'Role']) {
    await expect(page.getByRole('heading', { name: section })).toBeVisible()
  }

  const gallery = page.locator('section', { has: page.getByRole('heading', { name: 'From the gallery' }) })
  await gallery.getByRole('button').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()

  await page.locator('aside').getByRole('link', { name: 'Docker' }).click()
  await expect(page).toHaveURL(/skill=Docker/)
  await expect(page.locator(rows)).toHaveCount(6)
})

test('next and previous links walk through the projects', async ({ page }) => {
  await page.goto('projects/shopnow')
  await page.getByRole('navigation', { name: 'More projects' }).getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(/\/projects\/school-management$/)
})

test('an unknown project goes back to the list', async ({ page }) => {
  await page.goto('projects/not-a-project')
  await expect(page).toHaveURL(/\/projects$/)
})
