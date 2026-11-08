import type { Page } from '@playwright/test';
import { CheckoutPage } from './CheckoutPage';

export class CartPage {
  constructor(private readonly page: Page) {}
  async open(): Promise<void> {
    await this.page.goto('/cart');
  }
  getItem(id: string) {
    return this.page.getByTestId(`cart-item-${id}`);
  }
  getQuantity(id: string) {
    return this.page.getByTestId(`cart-item-quantity-${id}`);
  }
  getEmptyMessage() {
    return this.page.getByTestId('empty-cart-message');
  }
  async checkout(): Promise<CheckoutPage> {
    await this.page.getByTestId('checkout-button').click();
    return new CheckoutPage(this.page);
  }
}
