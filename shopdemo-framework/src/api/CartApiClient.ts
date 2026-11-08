import type { APIRequestContext, APIResponse } from '@playwright/test';

export class CartApiClient {
  constructor(private readonly request: APIRequestContext) {}

  getCart(): Promise<APIResponse> {
    return this.request.get('/api/cart');
  }

  addItem(productId: string, quantity = 1): Promise<APIResponse> {
    return this.request.post('/api/cart', { data: { productId, quantity } });
  }

  updateQuantity(id: string, quantity: number): Promise<APIResponse> {
    return this.request.patch(`/api/cart/${encodeURIComponent(id)}`, {
      data: { quantity },
    });
  }

  removeItem(id: string): Promise<APIResponse> {
    return this.request.delete(`/api/cart/${encodeURIComponent(id)}`);
  }
}
