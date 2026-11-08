import { test as base } from '@playwright/test';
import { startBrowserDiagnostics } from '../support/browserDiagnostics';
import { UserFactory } from '../data/UserFactory';
import { ProductsApiClient } from '../api/ProductsApiClient';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';

type TestFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  authenticatedHomePage: HomePage;
  productsApiClient: ProductsApiClient;
};

export const test = base.extend<TestFixtures>({
  // Lazy page override: standalone API tests do not create a browser.
  page: async ({ page }, use, testInfo) => {
    const stop = startBrowserDiagnostics(page);
    try {
      await use(page);
    } finally {
      const diagnostics = stop();
      if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('browser-diagnostics', {
          body: JSON.stringify(
            {
              title: testInfo.title,
              project: testInfo.project.name,
              retry: testInfo.retry,
              ...diagnostics,
            },
            null,
            2,
          ),
          contentType: 'application/json',
        });
      }
    }
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  signupPage: async ({ page }, use) => {
    await use(new SignupPage(page));
  },

  authenticatedHomePage: async ({ loginPage }, use) => {
    await loginPage.open();

    const homePage = await loginPage.loginAs(UserFactory.validCredentials());

    await use(homePage);
  },

  productsApiClient: async ({ request }, use) => {
    await use(new ProductsApiClient(request));
  },
});

export { expect } from '@playwright/test';
