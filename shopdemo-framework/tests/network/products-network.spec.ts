import { test, expect } from '../../src/fixtures/testFixtures';

test.describe('products-network', { tag: '@regression' }, () => {
  // Disable Service Workers only for network mocking tests.
  test.use({ serviceWorkers: 'block' });

  const productsEndpoint = (url: URL): boolean => url.pathname === '/api/products';

  test.describe('Product catalog — network mocking', () => {
    test('displays a product name overridden in the API response', async ({ page }) => {
      await page.route(productsEndpoint, async (route) => {
        const response = await route.fetch();
        const body = await response.json();

        const products = body.products.map((product: { id: string; name: string }) =>
          product.id === 'prod-001'
            ? { ...product, name: 'Playwright Mocked Headphones' }
            : product,
        );

        await route.fulfill({
          response,
          json: { products },
        });
      });

      await page.goto('/?e2eNoMsw=1');

      await expect(page.getByTestId('product-count')).toHaveText('14 products found');

      await expect(page.getByTestId('product-card-prod-001')).toContainText(
        'Playwright Mocked Headphones',
      );
    });

    test('shows the empty state when API returns no products', async ({ page }) => {
      await page.route(productsEndpoint, async (route) => {
        await route.fulfill({
          status: 200,
          json: { products: [] },
        });
      });

      await page.goto('/?e2eNoMsw=1');

      await expect(page.getByTestId('product-count')).toHaveText('0 products found');

      await expect(page.getByTestId('no-products')).toBeVisible();
      await expect(page.getByTestId('product-grid')).toHaveCount(0);
    });
  });
});
