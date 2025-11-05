import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for admin-app E2E tests
 *
 * Test against production by default
 * Set TEST_ENV=local to test against local dev server
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.TEST_ENV === 'local'
      ? 'http://localhost:5174'
      : 'https://admin.g-plat.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start webServer for local testing
  ...(process.env.TEST_ENV === 'local' && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5174',
      reuseExistingServer: true,
      timeout: 120000,
    },
  }),
})
