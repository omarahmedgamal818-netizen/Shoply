"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { z } from "zod";

const STORAGE_KEY = "nexcart-cart";

const cartLineSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  quantity: z.number().int().min(1).max(10),
  size: z.string().regex(/^[A-Za-z0-9]{1,8}$/).optional(),
});

export type CartLine = z.infer<typeof cartLineSchema>;
const storedCartSchema = z.array(cartLineSchema).max(30);

export function cartLineKey(line: { slug: string; size?: string }) {
  return `${line.slug}::${line.size ?? ""}`;
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  addItem: (slug: string, quantity?: number, size?: string) => void;
  setQuantity: (slug: string, quantity: number, size?: string) => void;
  removeItem: (slug: string, size?: string) => void;
  clear: () => void;
};

const emptyCart: CartLine[] = [];
let cartLines: CartLine[] = emptyCart;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function loadCart() {
  if (loaded) return;
  loaded = true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = storedCartSchema.safeParse(JSON.parse(raw));
    cartLines = parsed.success ? parsed.data : emptyCart;
    if (!parsed.success) window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  loadCart();
  return cartLines;
}

function getServerSnapshot() {
  return emptyCart;
}

function replaceCart(next: CartLine[]) {
  cartLines = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartLines));
  emit();
}

function clampQuantity(quantity: number) {
  return Math.min(10, Math.max(1, Math.floor(quantity)));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addItem = useCallback((slug: string, quantity = 1, size?: string) => {
    const amount = clampQuantity(quantity);
    const current = getSnapshot();
    const existing = current.find((line) => cartLineKey(line) === cartLineKey({ slug, size }));
    if (!existing) {
      replaceCart([...current, { slug, quantity: amount, size }]);
      return;
    }
    replaceCart(
      current.map((line) =>
        cartLineKey(line) === cartLineKey({ slug, size })
          ? { ...line, quantity: clampQuantity(line.quantity + amount) }
          : line,
      ),
    );
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number, size?: string) => {
    const current = getSnapshot();
    if (quantity <= 0) {
      replaceCart(current.filter((line) => cartLineKey(line) !== cartLineKey({ slug, size })));
      return;
    }
    const amount = clampQuantity(quantity);
    replaceCart(
      current.map((line) => (cartLineKey(line) === cartLineKey({ slug, size }) ? { ...line, quantity: amount } : line)),
    );
  }, []);

  const removeItem = useCallback((slug: string, size?: string) => {
    replaceCart(getSnapshot().filter((line) => cartLineKey(line) !== cartLineKey({ slug, size })));
  }, []);

  const clear = useCallback(() => replaceCart([]), []);

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [lines, addItem, setQuantity, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
