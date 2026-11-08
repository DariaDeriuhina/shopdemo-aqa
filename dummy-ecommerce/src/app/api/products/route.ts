import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/mocks/data/products';

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = (searchParams.get('search') ?? '').toLowerCase();
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';

  let result = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search) &&
      (!category || product.category === category),
  );

  if (sort === 'price_asc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result = [...result].sort((a, b) => b.price - a.price);
  }

  return NextResponse.json({ products: result });
}
