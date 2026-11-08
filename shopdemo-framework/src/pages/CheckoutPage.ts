import type { Page } from '@playwright/test';
import type { CheckoutDetails } from '../models/CheckoutDetails';

export class CheckoutPage {
  constructor(private readonly page: Page) {}
  async open(): Promise<void> {
    await this.page.goto('/checkout');
  }
  async fill(details: CheckoutDetails): Promise<void> {
    const shippingIds = {
      firstName: 'shipping-first-name',
      lastName: 'shipping-last-name',
      email: 'shipping-email',
      address: 'shipping-address',
      city: 'shipping-city',
      state: 'shipping-state',
      zipCode: 'shipping-zip',
    } as const;
    const paymentIds = {
      nameOnCard: 'payment-name',
      cardNumber: 'payment-card-number',
      expiryDate: 'payment-expiry',
      cvv: 'payment-cvv',
    } as const;
    for (const key of Object.keys(shippingIds) as (keyof typeof shippingIds)[])
      await this.page.getByTestId(shippingIds[key]).fill(details.shipping[key]);
    for (const key of Object.keys(paymentIds) as (keyof typeof paymentIds)[])
      await this.page.getByTestId(paymentIds[key]).fill(details.payment[key]);
  }
  async submit(): Promise<void> {
    await this.page.getByTestId('submit-order-button').click();
  }
  getFieldError(id: string) {
    return this.page.getByTestId(`field-error-${id}`);
  }
  getForm() {
    return this.page.getByTestId('checkout-form');
  }
}
