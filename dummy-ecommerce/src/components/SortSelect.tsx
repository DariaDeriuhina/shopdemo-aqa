interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const sortOptions = [
  { value: "", label: "Default" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div>
      <label htmlFor="sort-select" className="sr-only">
        Sort by
      </label>
      <select
        id="sort-select"
        data-testid="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
