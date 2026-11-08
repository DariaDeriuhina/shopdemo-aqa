"use client";
import Image from "next/image";

import { CartItem as CartItemType } from "@/types";
import { useCart } from "@/context/CartContext";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CartItemRow({ item }: { item: CartItemType }) {
  const { removeFromCart, changeQuantity } = useCart();

  return (
    <div
      data-testid={`cart-item-${item.id}`}
      className="flex items-center gap-4 py-4 border-b border-gray-200"
    >
      <Image
        unoptimized
        width={400}
        height={400}
        src={item.image}
        alt={item.name}
        className="w-20 h-20 object-cover rounded-lg"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-gray-600">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          data-testid={`quantity-decrease-${item.id}`}
          onClick={() => changeQuantity(item.id, -1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Decrease quantity of ${item.name}`}
        >
          -
        </button>
        <span
          data-testid={`cart-item-quantity-${item.id}`}
          className="w-8 text-center font-medium"
        >
          {item.quantity}
        </span>
        <button
          data-testid={`quantity-increase-${item.id}`}
          onClick={() => changeQuantity(item.id, 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
          aria-label={`Increase quantity of ${item.name}`}
        >
          +
        </button>
      </div>

      <p className="font-semibold text-gray-900 w-24 text-right">
        {formatPrice(item.price * item.quantity)}
      </p>

      <button
        data-testid={`remove-item-${item.id}`}
        onClick={() => removeFromCart(item.id)}
        className="text-red-500 hover:text-red-700 font-medium text-sm"
        aria-label={`Remove ${item.name} from cart`}
      >
        Remove
      </button>
    </div>
  );
}
