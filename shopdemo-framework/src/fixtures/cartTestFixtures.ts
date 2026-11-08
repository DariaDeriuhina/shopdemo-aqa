import type { APIRequestContext } from '@playwright/test';
import { test as base, expect } from './testFixtures';
import { CartApiClient } from '../api/CartApiClient';
import { CartSchema } from '../schemas/cartSchemas';

// context.request shares cookies with the UI, unlike the standalone request fixture.
export const test = base.extend<{
  cartRequestContext: APIRequestContext;
  cartApiClient: CartApiClient;
}>({
  cartRequestContext: async ({ context }, use) => {
    await use(context.request);
  },
  cartApiClient: async ({ cartRequestContext }, use) => {
    const client = new CartApiClient(cartRequestContext);
    try {
      expect((await client.getCart()).status()).toBe(200);
      await use(client);
    } finally {
      const response = await client.getCart();
      expect(response.status()).toBe(200);
      const cart = CartSchema.parse(await response.json());
      for (const item of cart.items) {
        expect((await client.removeItem(item.id)).status()).toBe(200);
      }
      const empty = await client.getCart();
      expect(CartSchema.parse(await empty.json())).toEqual({ items: [], total: 0 });
    }
  },
});
export { expect };
