import { test, expect } from '../../src/fixtures/testFixtures';

test.describe('products-errors', { tag: '@regression' }, () => {
  test.use({ serviceWorkers: 'block' });

  const isProductsRequest = (url: URL): boolean => url.pathname === '/api/products';

  test.describe('Product catalog — network failures', () => {
    test('displays loading state while products request is pending', async ({ page }) => {
      let releaseResponse: () => void = () => {};

      const responseGate = new Promise<void>((resolve) => {
        releaseResponse = resolve;
      });

      await page.route(isProductsRequest, async (route) => {
        await responseGate;

        const response = await route.fetch();

        await route.fulfill({ response });
      });

      try {
        await page.goto('/?e2eNoMsw=1');

        await expect(page.getByTestId('product-grid-loading')).toBeVisible();
        await expect(page.getByTestId('product-count')).toHaveText('Loading...');
      } finally {
        releaseResponse();
      }

      await expect(page.getByTestId('product-grid-loading')).toHaveCount(0);
      await expect(page.getByTestId('product-count')).toHaveText('14 products found');
      await expect(page.getByTestId('product-card-prod-001')).toBeVisible();
    });

    test('handles HTTP 500 response from products API', async ({ page }) => {
      await page.route(isProductsRequest, async (route) => {
        await route.fulfill({
          status: 500,
          json: {
            products: [],
            error: 'Internal Server Error',
          },
        });
      });

      const responsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/api/products' &&
          response.request().method() === 'GET',
      );

      await page.goto('/?e2eNoMsw=1');

      const response = await responsePromise;

      expect(response.status()).toBe(500);

      await expect(page.getByTestId('product-grid-loading')).toHaveCount(0);
      await expect(page.getByTestId('products-error')).toHaveText(
        'Unable to load products. Please try again.',
      );
      await expect(page.getByTestId('no-products')).toHaveCount(0);
    });

    test('handles network failure when products request is aborted', async ({ page }) => {
      await page.route(isProductsRequest, async (route) => {
        await route.abort('failed');
      });

      const failedRequestPromise = page.waitForEvent(
        'requestfailed',
        (request) => new URL(request.url()).pathname === '/api/products',
      );

      await page.goto('/?e2eNoMsw=1');

      const failedRequest = await failedRequestPromise;

      expect(failedRequest.failure()).not.toBeNull();

      await expect(page.getByTestId('product-grid-loading')).toHaveCount(0);
      await expect(page.getByTestId('products-error')).toHaveText(
        'Unable to load products. Please try again.',
      );
      await expect(page.getByTestId('no-products')).toHaveCount(0);
    });
  });
});
