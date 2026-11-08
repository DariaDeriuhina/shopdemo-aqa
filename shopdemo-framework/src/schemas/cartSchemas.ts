import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
  image: z.string().min(1),
});
export const CartSchema = z
  .object({
    items: z.array(CartItemSchema),
    total: z.number().int().nonnegative(),
  })
  .refine(
    (cart) => cart.total === cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    {
      message: 'Cart total must equal the sum of line totals',
      path: ['total'],
    },
  );
export type Cart = z.infer<typeof CartSchema>;
