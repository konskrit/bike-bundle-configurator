"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartBundle } from "@/types/cart";

const STORAGE_KEY = "bike-bundle-cart";

type CartContextValue = {
  bundles: CartBundle[];
  addBundle: (bundle: Omit<CartBundle, "id">) => void;
  removeBundle: (bundleId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

let bundles: CartBundle[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStorage(): CartBundle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartBundle[]) : [];
  } catch {
    return [];
  }
}

function getServerSnapshot() {
  return emptyBundles;
}

const emptyBundles: CartBundle[] = [];

function getClientSnapshot() {
  return bundles;
}

function persist(next: CartBundle[]) {
  bundles = next;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emit();
}

if (typeof window !== "undefined") {
  bundles = readStorage();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  const addBundle = useCallback((bundle: Omit<CartBundle, "id">) => {
    persist([...bundles, { ...bundle, id: crypto.randomUUID() }]);
  }, []);

  const removeBundle = useCallback((bundleId: string) => {
    persist(bundles.filter((bundle) => bundle.id !== bundleId));
  }, []);

  const clearCart = useCallback(() => {
    persist([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        bundles: snapshot,
        addBundle,
        removeBundle,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
