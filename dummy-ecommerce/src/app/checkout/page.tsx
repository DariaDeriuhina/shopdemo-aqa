"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CheckoutForm } from "@/components/CheckoutForm";
import { ShippingInfo, PaymentInfo } from "@/types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (shipping: ShippingInfo, payment: PaymentInfo) => {
    setIsSubmitting(true);
    setServerErrors({});

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shipping, payment }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setServerErrors(data.errors);
        } else if (data.error) {
          setServerErrors({ form: data.error });
        }
        return;
      }

      await refreshCart();
      router.push(`/order-confirmation?orderId=${data.order.orderId}`);
    } catch {
      setServerErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Checkout</h1>
        <p className="text-gray-500 mb-4">
          Your cart is empty. Add items before checking out.
        </p>
        <Link href="/" className="text-blue-600 hover:underline font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm py-1">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>{formatPrice(cart.total)}</span>
        </div>
      </div>

      {serverErrors.form && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 p-4 rounded-lg mb-6"
        >
          {serverErrors.form}
        </div>
      )}

      <CheckoutForm
        onSubmit={handleSubmit}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
