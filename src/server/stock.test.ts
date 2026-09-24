import { beforeEach, describe, expect, it } from "vitest";
import stockJson from "../../data/stock.json";
import { availableFor, checkStock, reserveStock } from "./stock";

const initialStock = stockJson as Record<string, number>;

function resetStock() {
  (
    globalThis as typeof globalThis & {
      __bikeBundleStock?: Record<string, number>;
    }
  ).__bikeBundleStock = { ...initialStock };
}

beforeEach(() => {
  resetStock();
});

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

describe("reserveStock", () => {
  it("decrements stock when the request fits", () => {
    const result = reserveStock([{ id: "bike-001", quantity: 2 }]);

    expect(result.ok).toBe(true);
    expect(availableFor("bike-001")).toBe(2);
  });

  it("leaves stock unchanged when the request does not fit", () => {
    const result = reserveStock([{ id: "bike-001", quantity: 99 }]);

    expect(result.ok).toBe(false);
    expect(availableFor("bike-001")).toBe(4);
  });
});
