import type { Locator, Page } from '@playwright/test';
import type { SignupDetails } from '../models/SignupDetails';
import { HomePage } from './HomePage';

export class SignupPage {
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly confirmPasswordInput: Locator;
  private readonly submitButton: Locator;
  private readonly heading: Locator;
  private readonly emailError: Locator;
  private readonly confirmPasswordError: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByTestId('signup-name');
    this.emailInput = page.getByTestId('signup-email');
    this.passwordInput = page.getByTestId('signup-password');
    this.confirmPasswordInput = page.getByTestId('signup-confirm-password');
    this.submitButton = page.getByTestId('signup-submit-button');
    this.heading = page.getByTestId('signup-heading');
    this.emailError = page.getByTestId('field-error-signup-email');
    this.confirmPasswordError = page.getByTestId('field-error-signup-confirm-password');
  }

  async open(): Promise<SignupPage> {
    await this.page.goto('/signup');
    return this;
  }

  async fillSignupForm(details: SignupDetails): Promise<void> {
    await this.nameInput.fill(details.name);
    await this.emailInput.fill(details.email);
    await this.passwordInput.fill(details.password);
    await this.confirmPasswordInput.fill(details.confirmPassword);
  }

  async submitSignup(): Promise<void> {
    await this.submitButton.click();
  }

  async register(details: SignupDetails): Promise<HomePage> {
    await this.fillSignupForm(details);
    await this.submitSignup();
    return new HomePage(this.page);
  }

  getHeading(): Locator {
    return this.heading;
  }
  getNameInput(): Locator {
    return this.nameInput;
  }
  getEmailInput(): Locator {
    return this.emailInput;
  }
  getPasswordInput(): Locator {
    return this.passwordInput;
  }
  getConfirmPasswordInput(): Locator {
    return this.confirmPasswordInput;
  }
  getEmailError(): Locator {
    return this.emailError;
  }
  getConfirmPasswordError(): Locator {
    return this.confirmPasswordError;
  }
}
