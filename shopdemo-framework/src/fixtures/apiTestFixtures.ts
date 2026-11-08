import { test as base } from './cartTestFixtures';

// API-only tests use Playwright's isolated HTTP context; no browser is needed.
// Integration tests keep cartTestFixtures and its shared browser cookie jar.
export const test = base.extend({
  cartRequestContext: async ({ request }, use) => {
    await use(request);
  },
});
export { expect } from '@playwright/test';
