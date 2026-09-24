import { describe, expect, it } from "vitest";
import { collectStockItems } from "./checkout";
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
