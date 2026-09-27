"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { withAccessoryQuantity } from "@/lib/cart-bundle";
import type { CartBundle } from "@/types/cart";

const STORAGE_KEY = "bike-bundle-cart";

type CartContextValue = {
  bundles: CartBundle[];
  addBundle: (bundle: Omit<CartBundle, "id">) => void;
  removeBundle: (bundleId: string) => void;
  updateAccessoryQuantity: (
    bundleId: string,
    accessoryId: string,
    quantity: number,
  ) => void;
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

function addBundle(bundle: Omit<CartBundle, "id">) {
  persist([...bundles, { ...bundle, id: crypto.randomUUID() }]);
}

function removeBundle(bundleId: string) {
  persist(bundles.filter((bundle) => bundle.id !== bundleId));
}

function updateAccessoryQuantity(
  bundleId: string,
  accessoryId: string,
  quantity: number,
) {
  persist(
    bundles.map((bundle) =>
      bundle.id === bundleId
        ? withAccessoryQuantity(bundle, accessoryId, quantity)
        : bundle,
    ),
  );
}

function clearCart() {
  persist([]);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  return (
    <CartContext.Provider
      value={{
        bundles: snapshot,
        addBundle,
        removeBundle,
        updateAccessoryQuantity,
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
