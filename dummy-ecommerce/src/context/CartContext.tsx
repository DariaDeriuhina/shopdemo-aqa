"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Cart } from "@/types";

interface CartContextType {
  cart: Cart;
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (cartItemId: string) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<boolean>;
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
  useEffect(() => {
    const controller = new AbortController();
    void fetchCart("/api/cart", { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setCart(data);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Unable to load your cart. Please reload.");
      });
    return () => controller.abort();
  }, []);
  const refreshCart = useCallback(async () => {
    setCart(await fetchCart());
    setError(null);
  }, []);
  const mutate = async (path: string, method: string, body?: object) => {
    try {
      setCart(
        await fetchCart(path, {
          method,
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        }),
      );
      setError(null);
      return true;
    } catch {
      setError("Unable to update the cart. Please try again.");
      return false;
    }
  };
  const addToCart = (productId: string, quantity = 1) =>
    mutate("/api/cart", "POST", { productId, quantity });
  const removeFromCart = (id: string) =>
    mutate(`/api/cart/${encodeURIComponent(id)}`, "DELETE");
  const updateQuantity = (id: string, quantity: number) =>
    mutate(`/api/cart/${encodeURIComponent(id)}`, "PATCH", { quantity });
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
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
