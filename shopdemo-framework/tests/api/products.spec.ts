import { test, expect } from '../../src/fixtures/testFixtures';
import {
  ProductResponseSchema,
  ProductsResponseSchema,
  ApiErrorSchema,
} from '../../src/schemas/productSchemas';

test.describe('products', { tag: '@regression' }, () => {
  test.describe('Products HTTP API', () => {
    test('returns the product catalog', { tag: '@smoke' }, async ({ productsApiClient }) => {
      const response = await productsApiClient.getProducts();

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body = ProductsResponseSchema.parse(await response.json());

      expect(body.products).toHaveLength(14);
      expect(body.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'prod-001',
            name: 'Wireless Headphones',
          }),
        ]),
      );
    });

    test('returns products matching a search query', async ({ productsApiClient }) => {
      const response = await productsApiClient.getProducts({
        search: 'Headphones',
      });

      expect(response.status()).toBe(200);

      const body = ProductsResponseSchema.parse(await response.json());

      expect(body.products).toHaveLength(1);
      expect(body.products[0].id).toBe('prod-001');
    });

    test('filters products by category', async ({ productsApiClient }) => {
      const response = await productsApiClient.getProducts({
        category: 'books',
      });

      expect(response.status()).toBe(200);

      const body = ProductsResponseSchema.parse(await response.json());

      expect(body.products).toHaveLength(3);
      expect(body.products.every((product) => product.category === 'books')).toBe(true);
    });

    for (const sort of ['price_asc', 'price_desc'] as const) {
      test(`sorts the complete catalog by ${sort}`, async ({ productsApiClient }) => {
        const baseline = await productsApiClient.getProducts();
        expect(baseline.status()).toBe(200);
        const { products: original } = ProductsResponseSchema.parse(await baseline.json());
        expect(original.length).toBeGreaterThan(1);

        const response = await productsApiClient.getProducts({ sort });
        expect(response.status()).toBe(200);
        const { products } = ProductsResponseSchema.parse(await response.json());
        // Order alone would also pass for an empty or truncated response.
        expect(products.map((product) => product.id).sort()).toEqual(
          original.map((product) => product.id).sort(),
        );
        const prices = products.map((product) => product.price);
        expect(prices).toEqual(
          original
            .map((product) => product.price)
            .sort((a, b) => (sort === 'price_asc' ? a - b : b - a)),
        );
      });
    }

    test('returns a product by ID', async ({ productsApiClient }) => {
      const response = await productsApiClient.getProductById('prod-001');

      expect(response.status()).toBe(200);

      const body = ProductResponseSchema.parse(await response.json());

      expect(body.product).toEqual(
        expect.objectContaining({
          id: 'prod-001',
          name: 'Wireless Headphones',
          price: 7999,
          inStock: true,
        }),
      );
    });

    test('returns 404 for a nonexistent product', async ({ productsApiClient }) => {
      const response = await productsApiClient.getProductById('nonexistent-product');

      expect(response.status()).toBe(404);

      const body = ApiErrorSchema.parse(await response.json());

      expect(body.error).toBe('Product not found');
    });

    test('returns an empty list when no products match', async ({ productsApiClient }) => {
      const response = await productsApiClient.getProducts({
        search: 'nonexistent-product-xyz-98765',
      });

      expect(response.status()).toBe(200);

      const body = ProductsResponseSchema.parse(await response.json());

      expect(body.products).toEqual([]);
    });
  });
});
