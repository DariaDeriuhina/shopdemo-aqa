import type { Page } from '@playwright/test';
import { CartPage } from './CartPage';

export class ProductPage {
  constructor(private readonly page: Page) {}
  async open(id: string): Promise<void> {
    await this.page.goto(`/products/${encodeURIComponent(id)}`);
  }
  async addToCart(quantity = 1): Promise<void> {
    await this.page.getByTestId('quantity-input').fill(String(quantity));
    await this.page.getByTestId('add-to-cart-button').click();
  }
  async openCart(): Promise<CartPage> {
    await this.page.getByTestId('cart-link').click();
    return new CartPage(this.page);
  }
  getAddButton() {
    return this.page.getByTestId('add-to-cart-button');
  }
  getNotification() {
    return this.page.getByTestId('added-notification');
  }
}
