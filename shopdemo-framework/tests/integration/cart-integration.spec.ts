import { test, expect } from '../../src/fixtures/cartTestFixtures';
import { CartSchema } from '../../src/schemas/cartSchemas';
import { ProductsResponseSchema } from '../../src/schemas/productSchemas';

test.describe('cart-integration', { tag: '@regression' }, () => {
  test(
    'API-created cart appears in UI and UI changes persist in API',
    { tag: '@smoke' },
    async ({ page, cartApiClient, productsApiClient }) => {
      const { products } = ProductsResponseSchema.parse(
        await (await productsApiClient.getProducts()).json(),
      );
      const product = products[0];
      const response = await cartApiClient.addItem(product.id, 2);
      expect(response.status()).toBe(200);
      const {
        items: [item],
      } = CartSchema.parse(await response.json());
      await page.goto('/cart');
      await expect(page.getByTestId(`cart-item-${item.id}`)).toContainText(product.name);
      await expect(page.getByTestId(`cart-item-quantity-${item.id}`)).toHaveText('2');
      await page.getByTestId(`quantity-increase-${item.id}`).click();
      await expect(page.getByTestId(`cart-item-quantity-${item.id}`)).toHaveText('3');
      const updated = CartSchema.parse(await (await cartApiClient.getCart()).json());
      expect(updated.items[0].quantity).toBe(3);
      await page.getByTestId(`remove-item-${item.id}`).click();
      await expect(page.getByTestId(`cart-item-${item.id}`)).toHaveCount(0);
      expect(CartSchema.parse(await (await cartApiClient.getCart()).json())).toEqual({
        items: [],
        total: 0,
      });
    },
  );

  test('mock checkout uses and clears the server cart', async ({
    page,
    cartApiClient,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const addedResponse = await cartApiClient.addItem(products[0].id, 2);
    expect(addedResponse.status()).toBe(200);
    const added = CartSchema.parse(await addedResponse.json());
    await page.goto('/cart');
    await expect(page.getByTestId(`cart-item-${added.items[0].id}`)).toBeVisible();
    const checkout = await page.evaluate(async () => {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            address: '1 Test St',
            city: 'Test',
            state: 'CA',
            zipCode: '12345',
          },
          payment: {
            cardNumber: '4111111111111111',
            expiryDate: '12/30',
            cvv: '123',
            nameOnCard: 'Test User',
          },
        }),
      });
      return { status: response.status, body: await response.json() };
    });
    expect(checkout.status).toBe(200);
    expect(checkout.body.order).toMatchObject({
      items: added.items,
      total: added.total,
      status: 'confirmed',
    });
    expect(CartSchema.parse(await (await cartApiClient.getCart()).json())).toEqual({
      items: [],
      total: 0,
    });
  });
});
