import { expect, test } from './fixtures'

test.describe('skills', () => {
  test('ranks the most-used tools and links each to its projects', async ({ page }) => {
    await page.goto('skills')
    const ranking = page.locator('ol').first()
    await expect(ranking.locator('li')).toHaveCount(8)
    await expect(ranking.locator('li').first()).toContainText('Terraform')

    await page.locator('a[href*="skill=React"]').first().click()
    await expect(page.locator('li:has(> a[href*="/projects/"])')).toHaveCount(3)
  })
})

test.describe('gallery', () => {
  test('groups by category, expands, and pages through one category', async ({ page }) => {
    await page.goto('gallery')
    const grid = page.locator('#gallery-grid')
    await expect(grid.getByRole('heading', { level: 3 })).toHaveCount(5)

    const tiles = grid.locator('ul > li')
    const before = await tiles.count()
    await grid.getByRole('button', { name: /Show all \d+/ }).first().click()
    await expect(tiles).not.toHaveCount(before)

    await grid.getByRole('button', { name: /^DevOps & Cloud/ }).click()
    await expect(page).toHaveURL(/category=DevOps/)
    await expect(tiles).toHaveCount(12)
    await grid.getByRole('button', { name: /Show more/ }).click()
    await expect(tiles).toHaveCount(22)
  })

  test('the lightbox steps through items with the keyboard', async ({ page }) => {
    await page.goto('gallery')
    await page.locator('#gallery-grid ul > li button').first().click()
    const dialog = page.getByRole('dialog')
    // Compare the media, not the title: an item's image and video share one.
    const media = dialog.locator('img, video').first()
    const first = await media.getAttribute('src')
    await page.keyboard.press('ArrowRight')
    await expect(media).not.toHaveAttribute('src', first ?? '')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })
})

test.describe('search', () => {
  test('finds a project from anywhere and opens it', async ({ page }) => {
    await page.goto('experience')
    // Wait for the page itself: the shortcut listener attaches once React has rendered.
    await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible()
    await page.keyboard.press('ControlOrMeta+k')
    const dialog = page.getByRole('dialog', { name: 'Search the site' })
    await expect(dialog).toBeVisible()
    await page.keyboard.type('self healing')
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/projects\/self-healing-system$/)
    await expect(dialog).toBeHidden()
  })

  test('slash opens it, Escape closes it and gives focus back', async ({ page }) => {
    await page.goto('projects')
    await page.getByRole('button', { name: /Search the site/ }).click()
    await page.keyboard.type('xyzzy')
    await expect(page.getByText(/Nothing matches/)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: /Search the site/ })).toBeFocused()
  })
})

test.describe('theme', () => {
  test('the toggle switches to dark and remembers it', async ({ page }) => {
    await page.goto('home')
    await page.getByRole('button', { name: 'Switch to dark mode' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible()
  })

  test.describe('with a dark system setting', () => {
    test.use({ colorScheme: 'dark' })
    test('starts dark', async ({ page }) => {
      await page.goto('home')
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    })
  })
})

test.describe('journal', () => {
  test('articles open on the site with the original linked', async ({ page }) => {
    await page.goto('journal')
    await page.getByRole('link', { name: /ECS Fargate or EKS/ }).click()
    await expect(page).toHaveURL(/\/journal\/ecs-vs-eks$/)
    const article = page.locator('.prose-article')
    await expect(article.locator('table').first()).toBeVisible()
    await expect(article.locator('pre').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Poly-Orchestrator on GitHub/ })).toHaveAttribute('target', '_blank')
  })

  test('entries without an article link out', async ({ page }) => {
    await page.goto('journal')
    await expect(page.getByRole('link', { name: /Auditing an AI Hiring Model/ })).toHaveAttribute('target', '_blank')
  })
})

test.describe('résumé', () => {
  test('prints without the site chrome', async ({ page }) => {
    await page.goto('resume')
    await expect(page.getByRole('heading', { name: 'Experience & education' })).toBeVisible()
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('header').first()).toBeHidden()
    await expect(page.getByRole('button', { name: 'Print / Save as PDF' })).toBeHidden()
  })
})
