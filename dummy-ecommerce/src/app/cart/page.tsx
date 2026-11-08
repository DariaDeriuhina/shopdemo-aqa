"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/CartItem";
import { CartSummary } from "@/components/CartSummary";

export default function CartPage() {
  const { cart } = useCart();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {cart.items.length === 0 ? (
        <div data-testid="empty-cart-message" className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty.</p>
          <Link
            href="/"
            className="text-blue-600 hover:underline font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div>
            {cart.items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <CartSummary total={cart.total} />
        </>
      )}
    </div>
  );
}
