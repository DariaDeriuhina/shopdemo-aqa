import { test, expect } from '../../src/fixtures/cartTestFixtures';
import { CartSchema } from '../../src/schemas/cartSchemas';

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test.describe('Cart UI request ordering', { tag: '@regression' }, () => {
  test.use({ serviceWorkers: 'block' });

  for (const firstFails of [false, true]) {
    test(`rapid quantity clicks preserve intent when first request ${firstFails ? 'fails' : 'succeeds'}`, async ({
      page,
      cartApiClient,
    }) => {
      const seeded = await cartApiClient.addItem('prod-001', 2);
      expect(seeded.status()).toBe(200);
      const {
        items: [item],
      } = CartSchema.parse(await seeded.json());
      await page.goto('/cart?e2eNoMsw=1');
      const quantity = page.getByTestId(`cart-item-quantity-${item.id}`);
      await expect(quantity).toHaveText('2');
      const entered = gate();
      const release = gate();
      const sentQuantities: number[] = [];
      await page.route(`**/api/cart/${item.id}`, async (route) => {
        sentQuantities.push(route.request().postDataJSON().quantity);
        if (sentQuantities.length === 1) {
          const response = firstFails ? undefined : await route.fetch();
          entered.release();
          await release.promise;
          if (response) await route.fulfill({ response });
          else await route.fulfill({ status: 500, json: { error: 'Controlled failure' } });
        } else await route.continue();
      });
      try {
        const increase = page.getByTestId(`quantity-increase-${item.id}`);
        await increase.click();
        await entered.promise;
        await increase.click();
        // The first response is deliberately pending; the rendered quantity is still two.
        await expect(quantity).toHaveText('2');
      } finally {
        release.release();
      }
      const expected = firstFails ? 3 : 4;
      await expect(quantity).toHaveText(String(expected));
      expect(sentQuantities).toEqual([3, expected]);
      const final = await cartApiClient.getCart();
      expect(final.status()).toBe(200);
      expect(CartSchema.parse(await final.json()).items[0].quantity).toBe(expected);
      await expect(page.getByTestId('cart-error')).toHaveCount(0);
    });
  }

  test('initial cart read finishes before an add and cannot overwrite its result', async ({
    page,
    cartApiClient,
  }) => {
    const seeded = await cartApiClient.addItem('prod-001', 2);
    expect(seeded.status()).toBe(200);
    const entered = gate();
    const release = gate();
    const methods: string[] = [];
    await page.route('**/api/cart', async (route) => {
      methods.push(route.request().method());
      if (methods.length === 1) {
        const response = await route.fetch();
        entered.release();
        await release.promise;
        await route.fulfill({ response });
      } else await route.continue();
    });
    try {
      await page.goto('/products/prod-001?e2eNoMsw=1');
      await entered.promise;
      await page.getByTestId('add-to-cart-button').click();
      await expect(page.getByTestId('added-notification')).toHaveCount(0);
      expect(methods).toEqual(['GET']);
    } finally {
      release.release();
    }
    await expect(page.getByTestId('added-notification')).toBeVisible();
    await expect(page.getByTestId('cart-count')).toHaveText('3');
    expect(methods).toEqual(['GET', 'POST']);
    const final = await cartApiClient.getCart();
    expect(final.status()).toBe(200);
    expect(CartSchema.parse(await final.json()).items[0].quantity).toBe(3);
  });
});
