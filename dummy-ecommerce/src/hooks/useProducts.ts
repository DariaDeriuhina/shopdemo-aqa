"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/types";

export function useProducts(search: string, category: string, sort: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ search, category, sort });
    // A changed query synchronizes this view with a new HTTP request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ products: Product[] }>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setProducts(data.products);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setProducts([]);
          setError("Unable to load products. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [search, category, sort]);
  return { products, loading, error };
}
