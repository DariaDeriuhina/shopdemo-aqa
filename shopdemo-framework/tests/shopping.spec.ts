import { test, expect } from '../src/fixtures/cartTestFixtures';
import { ProductPage } from '../src/pages/ProductPage';
import { CheckoutPage } from '../src/pages/CheckoutPage';
import { CartSchema } from '../src/schemas/cartSchemas';
import { ProductsResponseSchema } from '../src/schemas/productSchemas';
import { CheckoutFactory } from '../src/data/CheckoutFactory';

test.describe('Shopping journey', { tag: '@regression' }, () => {
  test('adds from product UI and preserves cart after reload', async ({
    page,
    cartApiClient,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const product = products[0];
    const productPage = new ProductPage(page);
    await test.step('Open product and add two units through UI', async () => {
      await productPage.open(product.id);
      await productPage.addToCart(2);
      await expect(productPage.getNotification()).toBeVisible();
    });
    const cart = CartSchema.parse(await (await cartApiClient.getCart()).json());
    expect(cart.items[0]).toMatchObject({ productId: product.id, quantity: 2 });
    await test.step('Open cart, reload and verify the same server state', async () => {
      const cartPage = await productPage.openCart();
      await expect(cartPage.getQuantity(cart.items[0].id)).toHaveText('2');
      await page.reload();
      await expect(cartPage.getQuantity(cart.items[0].id)).toHaveText('2');
    });
  });

  test('out-of-stock product cannot be added through UI', async ({ page, productsApiClient }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const productPage = new ProductPage(page);
    await productPage.open(products.find((p) => !p.inStock)!.id);
    await expect(productPage.getAddButton()).toBeDisabled();
  });

  test(
    'completes demo checkout through UI and clears the real cart',
    { tag: '@smoke' },
    async ({ page, cartApiClient, productsApiClient }) => {
      const { products } = ProductsResponseSchema.parse(
        await (await productsApiClient.getProducts()).json(),
      );
      await test.step('Prepare a real cart through API', async () => {
        expect((await cartApiClient.addItem(products[0].id, 2)).status()).toBe(200);
      });
      const checkout = new CheckoutPage(page);
      await test.step('Submit valid shipping and demo payment information', async () => {
        await checkout.open();
        await checkout.fill(CheckoutFactory.validDetails());
        await checkout.submit();
      });
      await test.step('Verify confirmation and server-side cart cleanup', async () => {
        await expect(page.getByTestId('order-confirmation')).toBeVisible();
        await expect(page.getByTestId('order-id')).toHaveText(/^ORD-\d+$/);
        expect(CartSchema.parse(await (await cartApiClient.getCart()).json())).toEqual({
          items: [],
          total: 0,
        });
      });
    },
  );

  test('checkout validation prevents an empty form submission', async ({
    page,
    cartApiClient,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    expect((await cartApiClient.addItem(products[0].id)).status()).toBe(200);
    const checkout = new CheckoutPage(page);
    await checkout.open();
    await expect(checkout.getForm()).toBeVisible();
    await checkout.submit();
    await expect(checkout.getFieldError('shipping-first-name')).toHaveText(
      'First name is required',
    );
    await expect(checkout.getFieldError('payment-card-number')).toHaveText(
      'Card number is required',
    );
    expect(CartSchema.parse(await (await cartApiClient.getCart()).json()).items).toHaveLength(1);
  });

  test('rejected cart mutation shows an error and preserves state', async ({
    page,
    cartApiClient,
    productsApiClient,
  }) => {
    const { products } = ProductsResponseSchema.parse(
      await (await productsApiClient.getProducts()).json(),
    );
    const productPage = new ProductPage(page);
    // Disable MSW explicitly for deterministic Playwright route interception.
    await page.goto(`/?e2eNoMsw=1`);
    await page.route('**/api/cart', (route) =>
      route.request().method() === 'POST'
        ? route.fulfill({ status: 500, json: { error: 'Simulated server failure' } })
        : route.continue(),
    );
    await page.getByTestId(`product-card-${products[0].id}`).click();
    await productPage.addToCart();
    await expect(page.getByTestId('cart-error')).toBeVisible();
    await expect(productPage.getNotification()).toHaveCount(0);
    expect(CartSchema.parse(await (await cartApiClient.getCart()).json())).toEqual({
      items: [],
      total: 0,
    });
  });
});
