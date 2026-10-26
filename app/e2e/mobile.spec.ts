import { journal, projects } from './content'
import { expect, test } from './fixtures'

const article = journal.find((entry) => entry.slug)
const paths = ['home', 'projects', `projects/${projects[0].slug}`, 'skills', 'gallery', 'resume']
if (article) paths.push(`journal/${article.slug}`)

for (const path of paths) {
  test(`${path} fits the screen without sideways scrolling`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('the menu opens and navigates', async ({ page }) => {
  await page.goto('home')
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await page.locator('#overlay-nav').getByText('Skills', { exact: true }).click()
  await expect(page).toHaveURL(/\/skills$/)
})
