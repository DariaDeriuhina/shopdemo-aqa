interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home", label: "Home" },
  { value: "books", label: "Books" },
];

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div>
      <label htmlFor="category-filter" className="sr-only">
        Filter by category
      </label>
      <select
        id="category-filter"
        data-testid="category-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
