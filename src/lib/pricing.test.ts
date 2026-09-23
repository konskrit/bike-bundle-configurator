import { describe, expect, it } from "vitest";
import { grossAmount, netAmount, totals } from "./pricing";

describe("pricing", () => {
  it("calculates net as price times quantity", () => {
    expect(netAmount(100, 2)).toBe(200);
  });

  it("calculates gross with tax rate", () => {
    expect(grossAmount(100, 0.19, 1)).toBe(119);
    expect(grossAmount(50, 0.19, 2)).toBe(119);
  });

  it("sums net and gross across lines", () => {
    expect(
      totals([
        { price: 100, taxRate: 0.19, quantity: 1 },
        { price: 50, taxRate: 0.19, quantity: 2 },
      ]),
    ).toEqual({ net: 200, gross: 238 });
  });
});
