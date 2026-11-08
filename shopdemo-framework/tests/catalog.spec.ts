import { test, expect } from '../src/fixtures/testFixtures';
import { ProductsResponseSchema } from '../src/schemas/productSchemas';

test.describe('catalog', { tag: '@regression' }, () => {
  test(
    'displays product catalog after login',
    { tag: '@smoke' },
    async ({ authenticatedHomePage }) => {
      await expect(authenticatedHomePage.getUserGreeting()).toContainText('Demo User');

      await expect(authenticatedHomePage.getProductGrid()).toBeVisible();
    },
  );

  test('shows empty state for a product search with no results', async ({ homePage }) => {
    await homePage.open();
    await homePage.searchProducts('nonexistent-product-xyz-98765');
    await expect(homePage.getNoProductsMessage()).toBeVisible();
  });

  test('category filter and sort match the real API', async ({ page, productsApiClient }) => {
    const catalog = await productsApiClient.getProducts({
      category: 'electronics',
      sort: 'price_asc',
    });
    expect(catalog.status()).toBe(200);
    const { products } = ProductsResponseSchema.parse(await catalog.json());
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product) => product.category === 'electronics')).toBe(true);
    await page.goto('/?e2eNoMsw=1');
    const response = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === '/api/products' &&
        new URL(r.url()).searchParams.get('category') === 'electronics' &&
        new URL(r.url()).searchParams.get('sort') === 'price_asc',
    );
    await page.getByTestId('category-filter').selectOption('electronics');
    await page.getByTestId('sort-select').selectOption('price_asc');
    await response;
    const cards = page.locator('[data-testid^="product-card-"]');
    await expect(cards).toHaveCount(products.length);
    await expect
      .poll(() =>
        cards.evaluateAll((elements) => elements.map((el) => el.getAttribute('data-testid'))),
      )
      .toEqual(products.map((p) => `product-card-${p.id}`));
  });
});
