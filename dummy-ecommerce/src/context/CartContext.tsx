"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import type { Cart } from "@/types";

interface CartContextType {
  cart: Cart;
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  changeQuantity: (cartItemId: string, delta: number) => Promise<boolean>;
  refreshCart: () => Promise<void>;
}
const CartContext = createContext<CartContextType | null>(null);
async function fetchCart(
  path = "/api/cart",
  options?: RequestInit,
): Promise<Cart> {
  const response = await fetch(path, options);
  if (!response.ok)
    throw new Error("Unable to update the cart. Please try again.");
  return response.json();
}
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [error, setError] = useState<string | null>(null);
  const currentCart = useRef(cart);
  const queue = useRef<Promise<void>>(Promise.resolve());
  // Serialize reads and writes, including the initial session-cookie request.
  // Recover the queue after failures so later actions are still processed.
  const enqueue = useCallback(function enqueue<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    const result = queue.current.then(operation);
    queue.current = result.then(
      () => {},
      () => {},
    );
    return result;
  }, []);
  const applyCart = useCallback((next: Cart) => {
    currentCart.current = next;
    setCart(next);
    setError(null);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void enqueue(async () => {
      if (controller.signal.aborted) return;
      try {
        const data = await fetchCart("/api/cart", {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) applyCart(data);
      } catch {
        if (!controller.signal.aborted)
          setError("Unable to load your cart. Please reload.");
      }
    });
    return () => controller.abort();
  }, [enqueue, applyCart]);
  const refreshCart = useCallback(
    () =>
      enqueue(async () => {
        applyCart(await fetchCart());
      }),
    [enqueue, applyCart],
  );
  const mutate = (path: string, method: string, body?: () => object) =>
    enqueue(async () => {
      try {
        applyCart(
          await fetchCart(path, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body()) : undefined,
          }),
        );
        return true;
      } catch {
        setError("Unable to update the cart. Please try again.");
        return false;
      }
    });
  const addToCart = (productId: string, quantity = 1) =>
    mutate("/api/cart", "POST", () => ({ productId, quantity }));
  const removeFromCart = (id: string) =>
    mutate(`/api/cart/${encodeURIComponent(id)}`, "DELETE");
  const changeQuantity = (id: string, delta: number) =>
    mutate(`/api/cart/${encodeURIComponent(id)}`, "PATCH", () => {
      // Resolve each click against the last confirmed state, not a stale render.
      const item = currentCart.current.items.find((item) => item.id === id);
      if (!item) throw new Error("Cart item no longer exists");
      return { quantity: item.quantity + delta };
    });
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        changeQuantity,
        refreshCart,
      }}
    >
      {error && (
        <p role="alert" data-testid="cart-error" className="p-4 text-red-700">
          {error}
        </p>
      )}
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
