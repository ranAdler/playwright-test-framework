import { defineConfig, devices } from '@playwright/test';
import config from './src/utilities/config/env';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: config.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
      },
      timeout: 180000,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: config.baseURL,
    reuseExistingServer: !process.env.CI,
  },
});