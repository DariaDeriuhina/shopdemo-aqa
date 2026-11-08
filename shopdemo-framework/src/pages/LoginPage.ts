import type { Locator, Page } from '@playwright/test';
import type { UserCredentials } from '../models/UserCredentials';
import { SignupPage } from './SignupPage';
import { HomePage } from './HomePage';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly signupLink: Locator;
  private readonly errorMessage: Locator;
  private readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit-button');
    this.signupLink = page.getByTestId('signup-link');
    this.errorMessage = page.getByTestId('login-error');
    this.heading = page.getByTestId('login-heading');
  }

  async open(): Promise<LoginPage> {
    await this.page.goto('/login');
    return this;
  }

  async fillLoginForm(credentials: UserCredentials): Promise<void> {
    await this.emailInput.fill(credentials.email);
    await this.passwordInput.fill(credentials.password);
  }

  async submitLogin(): Promise<void> {
    await this.submitButton.click();
  }

  async loginAs(credentials: UserCredentials): Promise<HomePage> {
    await this.fillLoginForm(credentials);
    await this.submitLogin();
    return new HomePage(this.page);
  }

  async openSignupPage(): Promise<SignupPage> {
    await this.signupLink.click();
    return new SignupPage(this.page);
  }

  getEmailInput(): Locator {
    return this.emailInput;
  }
  getPasswordInput(): Locator {
    return this.passwordInput;
  }
  getErrorMessage(): Locator {
    return this.errorMessage;
  }
  getHeading(): Locator {
    return this.heading;
  }
}
