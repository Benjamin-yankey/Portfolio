import { galleryGroupCount, galleryTileCount, journal, projects } from './content'
import { expect, test } from './fixtures'

test.describe('skills', () => {
  test('ranks the most-used tools and links each to its projects', async ({ page }) => {
    await page.goto('skills')
    const ranking = page.locator('ol').first()
    await expect(ranking.locator('li').first()).toBeVisible()
    expect(await ranking.locator('li').count()).toBeLessThanOrEqual(8)

    // A tool's link says how many projects use it; the list must agree.
    const link = page.locator('a[href*="skill="][title]').first()
    const count = Number((await link.getAttribute('title'))?.match(/\d+/)?.[0])
    await link.click()
    await expect(page.locator('li:has(> a[href*="/projects/"])')).toHaveCount(count)
  })
})

test.describe('gallery', () => {
  test('groups by category, expands, and pages through one category', async ({ page }) => {
    await page.goto('gallery')
    const grid = page.locator('#gallery-grid')
    await expect(grid.getByRole('heading', { level: 3 })).toHaveCount(galleryGroupCount)

    const tiles = grid.locator('ul > li')
    const expand = grid.getByRole('button', { name: /Show all \d+/ }).first()
    if ((await expand.count()) > 0) {
      const before = await tiles.count()
      await expand.click()
      await expect(tiles).not.toHaveCount(before)
    }

    // One category on its own shows 12 tiles at a time.
    const category = 'DevOps & Cloud'
    const total = galleryTileCount(category)
    test.skip(total === 0, `no "${category}" items`)
    await grid.getByRole('button', { name: new RegExp(`^${category}`) }).click()
    await expect(page).toHaveURL(/category=/)
    await expect(tiles).toHaveCount(Math.min(12, total))
    if (total > 12) {
      await grid.getByRole('button', { name: /Show more/ }).click()
      await expect(tiles).toHaveCount(Math.min(24, total))
    }
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
    await page.keyboard.type(projects[0].title)
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`/projects/${projects[0].slug}$`))
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
    const entry = journal.find((item) => item.slug)
    test.skip(!entry, 'no on-site articles')
    await page.goto('journal')
    await page.getByRole('link', { name: entry!.title }).click()
    await expect(page).toHaveURL(new RegExp(`/journal/${entry!.slug}$`))
    await expect(page.locator('.prose-article')).not.toBeEmpty()
    await expect(page.getByRole('link', { name: /on GitHub/ }).first()).toHaveAttribute('target', '_blank')
  })

  test('entries without an article link out', async ({ page }) => {
    const entry = journal.find((item) => !item.slug)
    test.skip(!entry, 'every entry has an article')
    await page.goto('journal')
    await expect(page.getByRole('link', { name: entry!.title })).toHaveAttribute('target', '_blank')
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
