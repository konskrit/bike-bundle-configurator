import { afterEach, describe, expect, it, vi } from "vitest";
import { collectStockItems, requestCheckout } from "./checkout";
import type { CartBundle } from "@/types/cart";
import type { Accessory, Bike } from "@/types/catalog";

const bike = (id: string): Bike => ({
  id,
  name: id,
  price: 100,
  taxRate: 0.19,
  frameType: "Urban",
});

const accessory = (id: string): Accessory => ({
  id,
  name: id,
  price: 10,
  taxRate: 0.19,
  maxAmount: 5,
  compatibleFrameTypes: ["Urban"],
});

const bundle = (
  id: string,
  bikeId: string,
  lines: { id: string; quantity: number }[] = [],
): CartBundle => ({
  id,
  bike: bike(bikeId),
  accessories: lines.map(({ id: accessoryId, quantity }) => ({
    accessory: accessory(accessoryId),
    quantity,
  })),
  net: 0,
  gross: 0,
});

describe("collectStockItems", () => {
  it("aggregates bikes and accessories across bundles", () => {
    expect(
      collectStockItems([
        bundle("1", "bike-a", [
          { id: "acc-1", quantity: 2 },
          { id: "acc-2", quantity: 1 },
        ]),
        bundle("2", "bike-a", [{ id: "acc-1", quantity: 1 }]),
        bundle("3", "bike-b"),
      ]),
    ).toEqual([
      { id: "bike-a", quantity: 2 },
      { id: "acc-1", quantity: 3 },
      { id: "acc-2", quantity: 1 },
      { id: "bike-b", quantity: 1 },
    ]);
  });

  it("returns an empty list for an empty cart", () => {
    expect(collectStockItems([])).toEqual([]);
  });
});

describe("requestCheckout", () => {
  const cart = [bundle("1", "bike-a")];

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function stubFetch(status: number) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status })),
    );
  }

  it("returns ok when the stock API succeeds", async () => {
    stubFetch(200);
    await expect(requestCheckout(cart)).resolves.toEqual({ ok: true });
  });

  it("maps 503 to stock_unavailable", async () => {
    stubFetch(503);
    await expect(requestCheckout(cart)).resolves.toEqual({
      ok: false,
      reason: "stock_unavailable",
    });
  });

  it("maps 409 to insufficient_stock", async () => {
    stubFetch(409);
    await expect(requestCheckout(cart)).resolves.toEqual({
      ok: false,
      reason: "insufficient_stock",
    });
  });

  it("maps other HTTP errors to failed", async () => {
    stubFetch(500);
    await expect(requestCheckout(cart)).resolves.toEqual({
      ok: false,
      reason: "failed",
    });
  });

  it("maps network failures to failed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(requestCheckout(cart)).resolves.toEqual({
      ok: false,
      reason: "failed",
    });
  });
});
