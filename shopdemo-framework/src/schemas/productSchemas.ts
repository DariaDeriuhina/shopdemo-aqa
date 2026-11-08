import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string().regex(/^prod-\d{3}$/),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().nonnegative(),
  category: z.enum(['electronics', 'clothing', 'home', 'books']),
  image: z.union([z.string().url(), z.string().regex(/^\/(?!\/)/)]),
  inStock: z.boolean(),
});

export const ProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
});

export const ProductResponseSchema = z.object({
  product: ProductSchema,
});

export const ApiErrorSchema = z.object({
  error: z.string().min(1),
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
