import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { products } from "@/mocks/data/products";
import type { CartItem } from "@/types";

// One process, development/demo storage. Shared by route modules and HMR.
const state = globalThis as typeof globalThis & {
  cartStore?: Map<string, { items: CartItem[]; expires: number }>;
};
const store = (state.cartStore ??= new Map<
  string,
  { items: CartItem[]; expires: number }
>());
const lifetime = 24 * 60 * 60 * 1000;
const cookieName = "shopdemo-cart";

export async function cartRequest(request: NextRequest, itemId?: string) {
  const now = Date.now();
  for (const [key, cart] of store) {
    if (cart.expires <= now) store.delete(key);
  }
  const cookie = request.cookies.get(cookieName)?.value;
  const session =
    cookie && /^[0-9a-f-]{36}$/.test(cookie) ? cookie : randomUUID();
  const reply = (body: unknown, status = 200) => {
    const response = NextResponse.json(body, { status });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(cookieName, session, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: lifetime / 1000,
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  };
  let body: Record<string, unknown> = {};
  if (request.method === "POST" || request.method === "PATCH") {
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return reply({ error: "Expected a JSON object" }, 400);
      }
      body = parsed as Record<string, unknown>;
    } catch {
      return reply({ error: "Invalid JSON" }, 400);
    }
    const quantity =
      body.quantity === undefined && request.method === "POST"
        ? 1
        : body.quantity;
    if (
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < (request.method === "POST" ? 1 : 0) ||
      quantity > 99
    ) {
      return reply({ error: "Quantity must be a valid integer" }, 400);
    }
    body.quantity = quantity;
  }
  const items = store.get(session)?.items ?? [];
  if (request.method === "POST") {
    if (typeof body.productId !== "string" || !body.productId.trim())
      return reply({ error: "Product ID is required" }, 400);
    const product = products.find((p) => p.id === body.productId);
    if (!product) return reply({ error: "Product not found" }, 404);
    if (!product.inStock)
      return reply({ error: "Product is out of stock" }, 409);
    const existing = items.find((item) => item.productId === product.id);
    const quantity = body.quantity as number;
    if (existing) {
      if (
        !Number.isSafeInteger(existing.quantity + quantity) ||
        existing.quantity + quantity > 99
      ) {
        return reply({ error: "Quantity is too large" }, 400);
      }
      existing.quantity += quantity;
    } else {
      items.push({
        id: `cart-${randomUUID()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
      });
    }
  } else if (request.method === "PATCH" || request.method === "DELETE") {
    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) return reply({ error: "Cart item not found" }, 404);
    if (request.method === "DELETE" || body.quantity === 0)
      items.splice(index, 1);
    else items[index].quantity = body.quantity as number;
  }
  if (items.length) store.set(session, { items, expires: now + lifetime });
  else store.delete(session);
  return reply({
    items,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  });
}
