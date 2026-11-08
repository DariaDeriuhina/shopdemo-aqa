import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <Image
          unoptimized
          width={400}
          height={400}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <div className="p-4">
        <span className="inline-block text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded mb-2 capitalize">
          {product.category}
        </span>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-gray-900 mt-1">
          {formatPrice(product.price)}
        </p>
        {!product.inStock && (
          <p className="text-sm text-red-500 mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
