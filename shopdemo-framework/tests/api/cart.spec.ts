import { test, expect } from '../../src/fixtures/apiTestFixtures';
import { CartSchema } from '../../src/schemas/cartSchemas';
import { ProductsResponseSchema } from '../../src/schemas/productSchemas';
import { CartApiClient } from '../../src/api/CartApiClient';
import type { APIResponse } from '@playwright/test';

test.describe('cart', { tag: '@regression' }, () => {
  async function cart(response: APIResponse) {
    expect(response.status()).toBe(200);
    return CartSchema.parse(await response.json());
  }

  test(
    'cart lifecycle, merging products and totals',
    { tag: '@smoke' },
    async ({ cartApiClient: api, productsApiClient }) => {
      const { products } = ProductsResponseSchema.parse(
        await (await productsApiClient.getProducts()).json(),
      );
      const product = products[0];
      expect(await cart(await api.getCart())).toEqual({ items: [], total: 0 });
      const added = await cart(await api.addItem(product.id, 2));
      const item = added.items[0];
      expect(item).toMatchObject({ productId: product.id, quantity: 2, price: product.price });
      expect(added.total).toBe(product.price * 2);
      const merged = await cart(await api.addItem(product.id));
      expect(merged.items).toHaveLength(1);
      expect(merged.items[0]).toMatchObject({ id: item.id, quantity: 3 });
      expect((await cart(await api.getCart())).items).toEqual(merged.items);
      const updated = await cart(await api.updateQuantity(item.id, 4));
      expect(updated.items[0].quantity).toBe(4);
      expect(updated.total).toBe(product.price * 4);
      expect(await cart(await api.removeItem(item.id))).toEqual({ items: [], total: 0 });
      expect(await cart(await api.getCart())).toEqual({ items: [], total: 0 });
    },
  );

  test('invalid input cannot mutate cart; zero removes an item', async ({
    cartApiClient: api,
    productsApiClient,
    request,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const product = products[0];
    for (const quantity of [0, -1, 1.5]) {
      expect((await api.addItem(product.id, quantity)).status()).toBe(400);
    }
    expect((await api.addItem('missing-product')).status()).toBe(404);
    expect(
      (
        await request.post('/api/cart', {
          data: '{',
          headers: { 'Content-Type': 'application/json' },
        })
      ).status(),
    ).toBe(400);
    const added = await cart(await api.addItem(product.id));
    const id = added.items[0].id;
    for (const quantity of [-1, 1.5])
      expect((await api.updateQuantity(id, quantity)).status()).toBe(400);
    expect((await request.patch(`/api/cart/${id}`, { data: {} })).status()).toBe(400);
    expect((await api.removeItem('missing-item')).status()).toBe(404);
    expect((await api.updateQuantity('missing-item', 1)).status()).toBe(404);
    expect(await cart(await api.getCart())).toEqual(added);
    expect(await cart(await api.updateQuantity(id, 0))).toEqual({ items: [], total: 0 });
  });

  test('separate sessions cannot read or change each other’s cart', async ({
    cartApiClient: api,
    productsApiClient,
    playwright,
    baseURL,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const added = await cart(await api.addItem(products[0].id));
    const otherContext = await playwright.request.newContext({ baseURL });
    try {
      const other = new CartApiClient(otherContext);
      expect(await cart(await other.getCart())).toEqual({ items: [], total: 0 });
      expect((await other.removeItem(added.items[0].id)).status()).toBe(404);
      expect((await other.updateQuantity(added.items[0].id, 5)).status()).toBe(404);
      expect(await cart(await api.getCart())).toEqual(added);
    } finally {
      await otherContext.dispose();
    }
  });
});
