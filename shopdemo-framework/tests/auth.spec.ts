import { test, expect } from '../src/fixtures/testFixtures';
import { UserFactory } from '../src/data/UserFactory';
import { invalidLoginCases } from './data/invalidLoginCases';

test.describe('auth', { tag: '@regression' }, () => {
  test.describe('Authentication', () => {
    test('fills login form with valid credentials', async ({ homePage }) => {
      await homePage.open();

      const loginPage = await homePage.openLoginPage();
      const credentials = UserFactory.validCredentials();

      await loginPage.fillLoginForm(credentials);

      await expect(loginPage.getEmailInput()).toHaveValue(credentials.email);
      await expect(loginPage.getPasswordInput()).toHaveValue(credentials.password);
    });

    for (const { title, credentials } of invalidLoginCases) {
      test(`rejects login for ${title}`, async ({ loginPage, page }) => {
        await loginPage.open();
        await loginPage.fillLoginForm(credentials);
        await loginPage.submitLogin();

        await expect(loginPage.getErrorMessage()).toHaveText('Invalid email or password');
        await expect(page).toHaveURL(/\/login$/);
      });
    }

    test('navigates from login to signup', async ({ loginPage, page }) => {
      await loginPage.open();

      const signupPage = await loginPage.openSignupPage();

      await expect(page).toHaveURL(/\/signup$/);
      await expect(signupPage.getHeading()).toBeVisible();
      await expect(signupPage.getNameInput()).toBeVisible();
    });

    test('logs in with a seeded account', { tag: '@smoke' }, async ({ loginPage, page }) => {
      await loginPage.open();

      const homePage = await loginPage.loginAs(UserFactory.validCredentials());

      await expect(page).toHaveURL(/\/$/);
      await expect(homePage.getUserGreeting()).toContainText('Demo User');
    });

    test('registers a new account with generated test data', async ({ signupPage, page }) => {
      await signupPage.open();

      const details = UserFactory.signupDetails();
      const homePage = await signupPage.register(details);

      await expect(page).toHaveURL(/\/$/);
      await expect(homePage.getUserGreeting()).toContainText(details.name);
    });

    test('rejects mismatching signup passwords', async ({ signupPage, page }) => {
      await signupPage.open();

      await signupPage.fillSignupForm(
        UserFactory.signupDetails({ confirmPassword: 'DifferentPass123!' }),
      );
      await signupPage.submitSignup();

      await expect(signupPage.getConfirmPasswordError()).toBeVisible();
      await expect(page).toHaveURL(/\/signup$/);
    });
  });

  test('seeded session survives reload and logout clears it', async ({
    page,
    authenticatedHomePage,
  }) => {
    await expect(authenticatedHomePage.getUserGreeting()).toContainText('Demo User');
    await page.reload();
    await expect(authenticatedHomePage.getUserGreeting()).toContainText('Demo User');
    await authenticatedHomePage.logout();
    await expect(authenticatedHomePage.getLoginLink()).toBeVisible();
    await page.reload();
    await expect(authenticatedHomePage.getLoginLink()).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('shopdemo_auth_token'))).toBeNull();
  });
});
