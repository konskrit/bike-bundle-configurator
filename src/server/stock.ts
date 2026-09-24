import "server-only";

import stockJson from "../../data/stock.json";
import { getAccessories, getBikes } from "@/server/catalog";

const initialStock = stockJson as Record<string, number>;

const globalForStock = globalThis as typeof globalThis & {
  __bikeBundleStock?: Record<string, number>;
};

function getStock() {
  return (globalForStock.__bikeBundleStock ??= { ...initialStock });
}

export function availableFor(id: string): number {
  return getStock()[id] ?? 0;
}

export async function withStockLatency<T>(
  run: () => T | Promise<T>,
): Promise<T> {
  await new Promise((resolve) => {
    setTimeout(resolve, 400 + Math.random() * 600);
  });

  if (Math.random() < 0.1) {
    throw new StockServiceError();
  }

  return run();
}

export class StockServiceError extends Error {
  constructor() {
    super("STOCK_SERVICE_FAILED");
    this.name = "StockServiceError";
  }
}

export function catalogStockLevels() {
  return [...getBikes(), ...getAccessories()].map((product) => ({
    id: product.id,
    available: availableFor(product.id),
  }));
}

export function checkStock(
  items: { id: string; quantity: number }[],
): { id: string; available: number; requested: number; ok: boolean }[] {
  return items.map((item) => {
    const available = availableFor(item.id);
    return {
      id: item.id,
      available,
      requested: item.quantity,
      ok: item.quantity <= available,
    };
  });
}

export function reserveStock(items: { id: string; quantity: number }[]) {
  const checked = checkStock(items);

  if (checked.some((item) => !item.ok)) {
    return { ok: false as const, items: checked };
  }

  const stock = getStock();
  for (const item of items) {
    stock[item.id] = availableFor(item.id) - item.quantity;
  }

  return { ok: true as const, items: checked };
}
