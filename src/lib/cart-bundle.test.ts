import { describe, expect, it } from "vitest";
import { withAccessoryQuantity } from "./cart-bundle";
import type { CartBundle } from "@/types/cart";

const bike = {
  id: "bike-001",
  name: "Touring Voyager 5.0",
  frameType: "Touring" as const,
  price: 100,
  taxRate: 0.19,
};

const helmet = {
  id: "acc-001",
  name: "Helmet",
  price: 10,
  taxRate: 0.19,
  compatibleFrameTypes: ["Touring" as const],
  maxAmount: 4,
};

const lock = {
  id: "acc-002",
  name: "Lock",
  price: 20,
  taxRate: 0.19,
  compatibleFrameTypes: ["Touring" as const],
  maxAmount: 2,
};

function bundle(accessories: CartBundle["accessories"]): CartBundle {
  return {
    id: "b1",
    bike,
    accessories,
    net: 0,
    gross: 0,
  };
}

describe("withAccessoryQuantity", () => {
  it("updates quantity and recalculates totals", () => {
    const next = withAccessoryQuantity(
      bundle([
        { accessory: helmet, quantity: 1 },
        { accessory: lock, quantity: 1 },
      ]),
      "acc-001",
      3,
    );

    expect(next.accessories).toEqual([
      { accessory: helmet, quantity: 3 },
      { accessory: lock, quantity: 1 },
    ]);
    expect(next.net).toBe(150);
    expect(next.gross).toBe(178.5);
  });

  it("removes accessory at quantity 0", () => {
    const next = withAccessoryQuantity(
      bundle([{ accessory: helmet, quantity: 1 }]),
      "acc-001",
      0,
    );

    expect(next.accessories).toEqual([]);
    expect(next.net).toBe(100);
    expect(next.gross).toBe(119);
  });

  it("caps quantity at maxAmount", () => {
    const next = withAccessoryQuantity(
      bundle([{ accessory: helmet, quantity: 1 }]),
      "acc-001",
      99,
    );

    expect(next.accessories[0]?.quantity).toBe(4);
  });
});
