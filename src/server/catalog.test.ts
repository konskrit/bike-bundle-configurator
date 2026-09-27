import { describe, expect, it } from "vitest";
import { getAccessoriesForFrame, getBike } from "./catalog";

describe("getAccessoriesForFrame", () => {
  it("returns only accessories compatible with the bike frame", () => {
    const bike = getBike("bike-001");
    expect(bike?.frameType).toBe("Touring");

    const accessories = getAccessoriesForFrame("Touring");
    expect(accessories.length).toBeGreaterThan(0);
    expect(
      accessories.every((accessory) =>
        accessory.compatibleFrameTypes.includes("Touring"),
      ),
    ).toBe(true);
  });

  it("excludes accessories that do not list the frame type", () => {
    const touringIds = new Set(
      getAccessoriesForFrame("Touring").map((accessory) => accessory.id),
    );

    expect(touringIds.has("acc-013")).toBe(false);
  });
});
