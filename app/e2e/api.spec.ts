import type { Page } from '@playwright/test'
import { expect, test } from './fixtures'

/** Stands in for the Worker's /api/health with the given features on. */
async function mockHealth(page: Page, features: { chat?: boolean; contact?: boolean }) {
  await page.route('**/api/health', (route) =>
    route.fulfill({ json: { chat: false, contact: false, turnstileSiteKey: null, ...features } }),
  )
}

test.describe('contact form', () => {
  test('falls back to the email app when the API is off', async ({ page }) => {
    await mockHealth(page, {})
    await page.goto('contact')
    await expect(page.getByText('Opens your email client with this message pre-filled.')).toBeVisible()
  })

  test('sends through the API when it is on', async ({ page }) => {
    await mockHealth(page, { contact: true })
    let sent: Record<string, unknown> | undefined
    await page.route('**/api/contact', async (route) => {
      sent = route.request().postDataJSON()
      await route.fulfill({ json: { ok: true } })
    })
    await page.goto('contact')
    await page.getByRole('textbox', { name: 'Your name' }).fill('Ada Lovelace')
    await page.getByRole('textbox', { name: 'Email' }).fill('ada@example.com')
    await page.getByRole('textbox', { name: 'Message' }).fill('Would love to talk about a platform role.')
    await page.getByRole('button', { name: /Send message/ }).click()
    await expect(page.getByText(/your message is on its way/)).toBeVisible()
    expect(sent).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', website: '' })
  })
})

test.describe('assistant', () => {
  test('answers from the API when chat is on', async ({ page }) => {
    await mockHealth(page, { chat: true })
    await page.route('**/api/chat', (route) =>
      route.fulfill({ json: { reply: 'He built ShopNow on both ECS and EKS.' } }),
    )
    await page.goto('home')
    await page.getByRole('button', { name: 'Ask a question' }).click()
    await expect(page.getByText(/AI answers based on this site/)).toBeVisible()
    await page.getByPlaceholder('Ask a question…').fill('What did he build on EKS?')
    await page.keyboard.press('Enter')
    await expect(page.getByText('He built ShopNow on both ECS and EKS.')).toBeVisible()
  })

  test('falls back to keyword answers when a request fails', async ({ page }) => {
    await mockHealth(page, { chat: true })
    await page.route('**/api/chat', (route) => route.fulfill({ status: 429, json: { error: 'rate-limited' } }))
    await page.goto('home')
    await page.getByRole('button', { name: 'Ask a question' }).click()
    await page.getByPlaceholder('Ask a question…').fill('What are your skills?')
    await page.keyboard.press('Enter')
    await expect(page.getByText(/works across:/)).toBeVisible()
  })
})
