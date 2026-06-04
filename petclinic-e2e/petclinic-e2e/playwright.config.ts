import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Spring PetClinic E2E harness.
 *
 * PetClinic runs on http://localhost:8080 by default.
 * Start it first (see README) before running tests.
 */
export default defineConfig({
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source.
  forbidOnly: !!process.env.CI,

  // Retry on CI only — surfaces flakiness locally instead of hiding it.
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI for stability; use all cores locally.
  workers: process.env.CI ? 1 : undefined,

  // HTML report — open with `npm run report` after a run.
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
  ],

  use: {
    // Base URL so tests can use relative paths like page.goto('/owners/find').
    baseURL: process.env.PETCLINIC_URL || 'http://localhost:8080',

    // Capture a trace on the first retry of a failing test — replay with
    // `npx playwright show-trace`. Set to 'on' while learning to always capture.
    trace: 'on-first-retry',

    // Screenshot only when a test fails.
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to run cross-browser once your tests are green on Chromium:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit',  use: { ...devices['Desktop Safari'] } },
  ],
});
