import type { APIRequestContext, APIResponse } from '@playwright/test';

export type ProductQueryParams = {
  search?: string;
  category?: string;
  sort?: 'price_asc' | 'price_desc';
};

export class ProductsApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async getProducts(params: ProductQueryParams = {}): Promise<APIResponse> {
    return this.request.get('/api/products', {
      params,
    });
  }

  async getProductById(id: string): Promise<APIResponse> {
    return this.request.get(`/api/products/${encodeURIComponent(id)}`);
  }
}
