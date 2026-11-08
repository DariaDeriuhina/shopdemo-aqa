"use client";

import { useState, useCallback } from "react";
import { useProducts } from "@/hooks/useProducts";
import { ProductGrid } from "@/components/ProductGrid";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SortSelect } from "@/components/SortSelect";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const { products, loading, error } = useProducts(search, category, sort);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Products</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} />
        </div>
        <div className="w-full sm:w-48">
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
        <div className="w-full sm:w-48">
          <SortSelect value={sort} onChange={setSort} />
        </div>
      </div>

      <p data-testid="product-count" className="text-sm text-gray-500 mb-4">
        {loading
          ? "Loading..."
          : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
      </p>

      {error ? (
        <p role="alert" data-testid="products-error" className="text-red-700">
          {error}
        </p>
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </div>
  );
}
