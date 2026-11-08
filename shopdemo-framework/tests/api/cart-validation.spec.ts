import { test, expect } from '../../src/fixtures/apiTestFixtures';
import { CartSchema } from '../../src/schemas/cartSchemas';
import { ProductsResponseSchema, ApiErrorSchema } from '../../src/schemas/productSchemas';

test.describe('Cart validation and concurrency', { tag: '@regression' }, () => {
  for (const quantity of [null, '2', true, {}, [], -1, 0, 1.5, 100]) {
    test(`rejects invalid quantity ${JSON.stringify(quantity)} without changing state`, async ({
      cartApiClient,
      request,
      productsApiClient,
    }) => {
      const { products } = ProductsResponseSchema.parse(
        await (await productsApiClient.getProducts()).json(),
      );
      const response = await request.post('/api/cart', {
        data: { productId: products[0].id, quantity },
      });
      expect(response.status()).toBe(400);
      ApiErrorSchema.parse(await response.json());
      const cart = CartSchema.parse(await (await cartApiClient.getCart()).json());
      expect(cart).toEqual({ items: [], total: 0 });
    });
  }

  test('defaults quantity, checks stock, and caps merged quantities', async ({
    cartApiClient,
    request,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const product = products.find((p) => p.inStock)!;
    const unavailable = products.find((p) => !p.inStock)!;
    expect((await request.post('/api/cart', { data: { quantity: 1 } })).status()).toBe(400);
    expect((await cartApiClient.addItem(unavailable.id)).status()).toBe(409);
    const added = await request.post('/api/cart', { data: { productId: product.id } });
    expect(added.status()).toBe(200);
    const first = CartSchema.parse(await added.json());
    expect(first.items[0].quantity).toBe(1);
    expect((await cartApiClient.updateQuantity(first.items[0].id, 99)).status()).toBe(200);
    expect((await cartApiClient.addItem(product.id)).status()).toBe(400);
    expect(CartSchema.parse(await (await cartApiClient.getCart()).json()).items[0].quantity).toBe(
      99,
    );
  });

  test('concurrent additions in one initialized session are not lost', async ({
    cartApiClient,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const product = products[0];
    await test.step('Send five additions concurrently', async () => {
      const responses = await Promise.all(
        Array.from({ length: 5 }, () => cartApiClient.addItem(product.id)),
      );
      for (const response of responses) expect(response.status()).toBe(200);
    });
    await test.step('Read the final state and verify arithmetic', async () => {
      const cart = CartSchema.parse(await (await cartApiClient.getCart()).json());
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
      expect(cart.total).toBe(product.price * 5);
    });
  });

  test('multiple products contribute to total and deleting one preserves the other', async ({
    cartApiClient,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const [first, second] = products.filter((p) => p.inStock);
    expect((await cartApiClient.addItem(first.id, 2)).status()).toBe(200);
    const response = await cartApiClient.addItem(second.id, 3);
    expect(response.status()).toBe(200);
    const cart = CartSchema.parse(await response.json());
    expect(cart.items).toHaveLength(2);
    expect(cart.total).toBe(first.price * 2 + second.price * 3);
    const removed = await cartApiClient.removeItem(
      cart.items.find((item) => item.productId === first.id)!.id,
    );
    expect(removed.status()).toBe(200);
    expect(CartSchema.parse(await removed.json())).toMatchObject({
      total: second.price * 3,
      items: [{ productId: second.id, quantity: 3 }],
    });
  });

  test('session cookie is HttpOnly, SameSite=Lax; cart responses are not cached', async ({
    cartApiClient,
    request,
  }) => {
    const response = await cartApiClient.getCart();
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('no-store');
    const { cookies } = await request.storageState();
    const cookie = cookies.find((c) => c.name === 'shopdemo-cart');
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax', path: '/' });
  });
});
