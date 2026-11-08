import { defineConfig, devices } from '@playwright/test';
import { environment as env } from './src/config/environment';

const browserDevices = {
  chromium: devices['Desktop Chrome'],
  firefox: devices['Desktop Firefox'],
  webkit: devices['Desktop Safari'],
};
const production = (env.appMode ?? 'production') === 'production';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  globalTimeout: env.isCI ? 15 * 60_000 : undefined,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: env.isCI,
  failOnFlakyTests: env.isCI,
  retries: env.retries ?? (env.isCI ? 1 : 0),
  workers: env.workers ?? (env.isCI ? 1 : 4),
  reporter: [
    ['list'],
    ['./src/support/GitHubSummaryReporter.ts'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: env.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'api', testMatch: '**/api/**/*.spec.ts' },
    ...env.browsers.map((name) => ({
      name,
      testIgnore: '**/api/**/*.spec.ts',
      use: { ...browserDevices[name] },
    })),
  ],
  webServer: env.startWebServer
    ? {
        command: `${production ? 'npm run build && npm run start' : 'npm run dev'} -- --hostname ${env.hostname} --port ${env.port}`,
        cwd: '../dummy-ecommerce',
        url: `${env.baseURL}/api/products`,
        reuseExistingServer: !env.isCI && !production,
        timeout: 180_000,
        env: { NEXT_TELEMETRY_DISABLED: '1' },
      }
    : undefined,
});
