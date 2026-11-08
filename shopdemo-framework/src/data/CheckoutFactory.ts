import type { CheckoutDetails } from '../models/CheckoutDetails';

export class CheckoutFactory {
  static validDetails(): CheckoutDetails {
    return {
      shipping: {
        firstName: 'Test',
        lastName: 'User',
        email: 'qa@example.com',
        address: '1 Test Street',
        city: 'Test City',
        state: 'CA',
        zipCode: '12345',
      },
      payment: {
        nameOnCard: 'Test User',
        cardNumber: '4111111111111111',
        expiryDate: '12/30',
        cvv: '123',
      },
    };
  }
}
