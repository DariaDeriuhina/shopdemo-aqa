import Link from "next/link";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CartSummary({ total }: { total: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total</span>
        <span data-testid="cart-total">{formatPrice(total)}</span>
      </div>
      <Link
        href="/checkout"
        data-testid="checkout-button"
        className="mt-4 block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}
