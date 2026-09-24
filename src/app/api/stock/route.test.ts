import { beforeEach, describe, expect, it, vi } from "vitest";
import stockJson from "../../../../data/stock.json";
import { availableFor } from "@/server/stock";

vi.mock("@/server/stock", async (importOriginal) => {
  const stock = await importOriginal<typeof import("@/server/stock")>();
  return {
    ...stock,
    withStockLatency: async <T>(run: () => T | Promise<T>) => run(),
  };
});

import { POST } from "./route";

const initialStock = stockJson as Record<string, number>;

function resetStock() {
  (
    globalThis as typeof globalThis & {
      __bikeBundleStock?: Record<string, number>;
    }
  ).__bikeBundleStock = { ...initialStock };
}

function post(body: unknown) {
  return POST(
    new Request("http://127.0.0.1/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  resetStock();
});

describe("POST /api/stock", () => {
  it("rejects non-integer quantities", async () => {
    const response = await post({
      items: [{ id: "bike-001", quantity: 1.5 }],
    });

    expect(response.status).toBe(400);
    expect(availableFor("bike-001")).toBe(4);
  });

  it("reserves stock when the request fits", async () => {
    const response = await post({
      items: [{ id: "bike-001", quantity: 2 }],
    });

    expect(response.status).toBe(200);
    expect(availableFor("bike-001")).toBe(2);
  });

  it("returns 409 when stock is insufficient", async () => {
    const response = await post({
      items: [{ id: "bike-001", quantity: 99 }],
    });

    expect(response.status).toBe(409);
    expect(availableFor("bike-001")).toBe(4);
  });
});
