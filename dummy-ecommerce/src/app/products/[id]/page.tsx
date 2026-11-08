"use client";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product || null);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!(await addToCart(product.id, quantity))) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="text-blue-600 hover:underline text-sm mb-6 inline-block"
      >
        &larr; Back to Products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            unoptimized
            width={400}
            height={400}
            src={product.image}
            alt={product.name}
            data-testid="product-image"
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <span
            data-testid="product-category"
            className="inline-block text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded capitalize mb-3"
          >
            {product.category}
          </span>
          <h1
            data-testid="product-name"
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            {product.name}
          </h1>
          <p
            data-testid="product-price"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            {formatPrice(product.price)}
          </p>
          <p
            data-testid="product-description"
            className="text-gray-600 mb-6 leading-relaxed"
          >
            {product.description}
          </p>

          {product.inStock ? (
            <p className="text-green-600 font-medium mb-4">In Stock</p>
          ) : (
            <p className="text-red-500 font-medium mb-4">Out of Stock</p>
          )}

          <div className="flex items-center gap-4 mb-4">
            <label htmlFor="quantity" className="font-medium text-gray-700">
              Quantity:
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              max="99"
              data-testid="quantity-input"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <button
            data-testid="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {added ? "Added to Cart!" : "Add to Cart"}
          </button>

          {added && (
            <p
              data-testid="added-notification"
              className="text-green-600 text-center mt-2 font-medium"
            >
              Item added to your cart
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
