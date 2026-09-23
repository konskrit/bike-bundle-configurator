export type PriceLine = {
  price: number;
  taxRate: number;
  quantity: number;
};

export type MoneyTotals = {
  net: number;
  gross: number;
};

export function netAmount(price: number, quantity: number): number {
  return price * quantity;
}

export function grossAmount(
  price: number,
  taxRate: number,
  quantity: number,
): number {
  return netAmount(price, quantity) * (1 + taxRate);
}

export function totals(lines: PriceLine[]): MoneyTotals {
  return lines.reduce<MoneyTotals>(
    (acc, line) => ({
      net: acc.net + netAmount(line.price, line.quantity),
      gross: acc.gross + grossAmount(line.price, line.taxRate, line.quantity),
    }),
    { net: 0, gross: 0 },
  );
}
