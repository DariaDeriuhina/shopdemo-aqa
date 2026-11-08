import { test, expect } from '../../src/fixtures/testFixtures';
import { ProductsResponseSchema } from '../../src/schemas/productSchemas';

test.describe('products-integration', { tag: '@regression' }, () => {
  test.use({ serviceWorkers: 'block' });

  test.describe('Products API and UI integration', () => {
    test('displays products returned by the API', async ({ page, productsApiClient }) => {
      // Arrange: get real product data from the backend.
      const apiResponse = await productsApiClient.getProducts();

      expect(apiResponse.status()).toBe(200);

      const { products } = ProductsResponseSchema.parse(await apiResponse.json());

      expect(products.length).toBeGreaterThan(0);

      // Act: open the real catalog without MSW.
      await page.goto('/?e2eNoMsw=1');

      // Assert: the displayed product count matches the API.
      await expect(page.getByTestId('product-count')).toHaveText(
        `${products.length} products found`,
      );

      // Assert: each API product is displayed in the UI.
      for (const product of products) {
        const productCard = page.getByTestId(`product-card-${product.id}`);

        await expect(productCard).toBeAttached();
        await expect(productCard).toContainText(product.name);
      }
    });
  });
});
