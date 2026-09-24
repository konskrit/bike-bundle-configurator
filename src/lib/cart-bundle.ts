import { bundleTotals } from "@/lib/pricing";
import type { CartBundle } from "@/types/cart";

export function withAccessoryQuantity(
  bundle: CartBundle,
  accessoryId: string,
  quantity: number,
): CartBundle {
  const nextQuantity = Math.max(0, Math.floor(quantity));

  const accessories = bundle.accessories
    .map((line) => {
      if (line.accessory.id !== accessoryId) {
        return line;
      }

      return {
        ...line,
        quantity: Math.min(nextQuantity, line.accessory.maxAmount),
      };
    })
    .filter((line) => line.quantity > 0);

  const money = bundleTotals(bundle.bike, accessories);
  return {
    ...bundle,
    accessories,
    net: money.net,
    gross: money.gross,
  };
}
