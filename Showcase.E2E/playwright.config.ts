import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://showcase-web:3000';

console.log(`\n\x1b[33m[DEBUG] Playwright draait met Base URL: "${baseURL}"\x1b[0m\n`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});