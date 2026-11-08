"use client";

import { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (value: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div>
      <label htmlFor="search" className="sr-only">
        Search products
      </label>
      <input
        id="search"
        type="text"
        data-testid="search-input"
        placeholder="Search products..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
    </div>
  );
}
