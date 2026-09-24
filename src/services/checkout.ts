import type { CartBundle } from "@/types/cart";

export type CheckoutResult =
  | { ok: true }
  | {
      ok: false;
      reason: "stock_unavailable" | "insufficient_stock" | "failed";
    };

export function collectStockItems(bundles: CartBundle[]) {
  const quantities = new Map<string, number>();

  for (const bundle of bundles) {
    quantities.set(bundle.bike.id, (quantities.get(bundle.bike.id) ?? 0) + 1);

    for (const { accessory, quantity } of bundle.accessories) {
      quantities.set(
        accessory.id,
        (quantities.get(accessory.id) ?? 0) + quantity,
      );
    }
  }

  return [...quantities.entries()].map(([id, quantity]) => ({ id, quantity }));
}

export async function requestCheckout(
  bundles: CartBundle[],
): Promise<CheckoutResult> {
  try {
    const response = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: collectStockItems(bundles) }),
    });

    if (response.status === 503) {
      return { ok: false, reason: "stock_unavailable" };
    }

    if (response.status === 409) {
      return { ok: false, reason: "insufficient_stock" };
    }

    if (!response.ok) {
      return { ok: false, reason: "failed" };
    }

    return { ok: true };
  } catch {
    return { ok: false, reason: "failed" };
  }
}
