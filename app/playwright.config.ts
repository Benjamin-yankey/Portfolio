import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests against the production build: `npm run build`, then
 * `npm run test:e2e` (CI does both). Reduced motion is emulated so scroll
 * reveals are instant and the WebGL scenes stay off — the tests check the
 * site's behavior, not animation timing.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173/Portfolio/',
    reducedMotion: 'reduce',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/Portfolio/',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /mobile\.spec\.ts/ },
  ],
})
