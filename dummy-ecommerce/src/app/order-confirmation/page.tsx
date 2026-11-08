"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div
      data-testid="order-confirmation"
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center"
    >
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>

      {orderId && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Order ID</p>
          <p data-testid="order-id" className="text-lg font-mono font-bold text-gray-900">
            {orderId}
          </p>
        </div>
      )}

      <Link
        href="/"
        data-testid="continue-shopping-link"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
