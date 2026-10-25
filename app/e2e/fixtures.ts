import { expect, test as base } from '@playwright/test'

/**
 * `test` with a guard on every page: any uncaught exception or console
 * error fails the test. Failed network loads are left out — they're about
 * the network (third-party images, an absent local API), not the code.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
          errors.push(message.text())
        }
      })
      await use(errors)
      expect(errors, 'console errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
