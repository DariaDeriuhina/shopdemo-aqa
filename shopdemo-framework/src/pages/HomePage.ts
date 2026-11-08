import type { Locator, Page } from '@playwright/test';
import { LoginPage } from './LoginPage';
import { SignupPage } from './SignupPage';

export class HomePage {
  private readonly loginLink: Locator;
  private readonly signupLink: Locator;
  private readonly searchInput: Locator;
  private readonly productGrid: Locator;
  private readonly noProductsMessage: Locator;
  private readonly userGreeting: Locator;
  private readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.loginLink = page.getByTestId('nav-login-link');
    this.signupLink = page.getByTestId('nav-signup-link');
    this.searchInput = page.getByTestId('search-input');
    this.productGrid = page.getByTestId('product-grid');
    this.noProductsMessage = page.getByTestId('no-products');
    this.userGreeting = page.getByTestId('user-greeting');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async open(): Promise<HomePage> {
    await this.page.goto('/');
    return this;
  }

  async openLoginPage(): Promise<LoginPage> {
    await this.loginLink.click();
    return new LoginPage(this.page);
  }

  async openSignupPage(): Promise<SignupPage> {
    await this.signupLink.click();
    return new SignupPage(this.page);
  }

  async searchProducts(query: string): Promise<void> {
    await this.searchInput.fill(query);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  getProductGrid(): Locator {
    return this.productGrid;
  }

  getNoProductsMessage(): Locator {
    return this.noProductsMessage;
  }

  getUserGreeting(): Locator {
    return this.userGreeting;
  }

  getLoginLink(): Locator {
    return this.loginLink;
  }
}
