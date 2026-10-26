import { expect, test } from './fixtures'

// Loads the real editor from unpkg, so this catches a config.yml it can't
// read and an integrity hash left stale after a version bump — either would
// leave the CMS blank. Sign-in itself needs GitHub, so it isn't exercised.
test('the CMS loads and offers every sign-in option', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('admin/', { waitUntil: 'commit' })
  // Labels wrap "GitHub" in invisible direction marks, hence the loose match.
  await expect(page.getByRole('button', { name: /Sign In with\s.?GitHub/ })).toBeVisible({ timeout: 45_000 })
  await expect(page.getByRole('button', { name: 'Sign In Using Access Token' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Work with Local Repository' })).toBeVisible()
})
