import { describe, expect, it } from "vitest";
import { availableFor, checkStock } from "./stock";

describe("availableFor", () => {
  it("returns stock for known products and zero for unknown", () => {
    expect(availableFor("bike-001")).toBe(4);
    expect(availableFor("missing-id")).toBe(0);
  });
});

describe("checkStock", () => {
  it("marks items ok when requested quantity fits available stock", () => {
    expect(
      checkStock([
        { id: "bike-001", quantity: 2 },
        { id: "acc-010", quantity: 1 },
      ]),
    ).toEqual([
      {
        id: "bike-001",
        available: 4,
        requested: 2,
        ok: true,
      },
      {
        id: "acc-010",
        available: 0,
        requested: 1,
        ok: false,
      },
    ]);
  });
});
