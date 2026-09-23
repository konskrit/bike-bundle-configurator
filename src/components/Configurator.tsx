"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccessoryList } from "@/components/AccessoryList";
import { BikePicker } from "@/components/BikePicker";
import { BundleSummary } from "@/components/BundleSummary";
import { useCart } from "@/components/CartProvider";
import { totals, type PriceLine } from "@/lib/pricing";
import type { Accessory, Bike } from "@/types/catalog";
import type { CartAccessoryLine } from "@/types/cart";

type Props = {
  bikes: Bike[];
  accessories: Accessory[];
};

export function Configurator({ bikes, accessories }: Props) {
  const translate = useTranslations("App");
  const { addBundle } = useCart();
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const selectedBike = bikes.find((bike) => bike.id === selectedBikeId) ?? null;

  function handleSelectBike(bikeId: string) {
    setSelectedBikeId(bikeId);
    setQuantities({});
  }

  function handleQuantityChange(accessoryId: string, quantity: number) {
    setQuantities((current) => ({ ...current, [accessoryId]: quantity }));
  }

  const accessoryLines: CartAccessoryLine[] = [];
  for (const [accessoryId, quantity] of Object.entries(quantities)) {
    if (quantity <= 0) {
      continue;
    }

    const accessory = accessories.find((item) => item.id === accessoryId);
    if (!accessory) {
      continue;
    }

    accessoryLines.push({ accessory, quantity });
  }

  const priceLines: PriceLine[] = selectedBike
    ? [
        {
          price: selectedBike.price,
          taxRate: selectedBike.taxRate,
          quantity: 1,
        },
        ...accessoryLines.map(({ accessory, quantity }) => ({
          price: accessory.price,
          taxRate: accessory.taxRate,
          quantity,
        })),
      ]
    : [];
  const bundleTotals = totals(priceLines);

  function handleAddToCart() {
    if (!selectedBike) {
      return;
    }

    addBundle({
      bike: selectedBike,
      accessories: accessoryLines,
      net: bundleTotals.net,
      gross: bundleTotals.gross,
    });
    setSelectedBikeId(null);
    setQuantities({});
  }

  return (
    <>
      <BikePicker
        bikes={bikes}
        selectedBikeId={selectedBikeId}
        onSelect={handleSelectBike}
      />
      <AccessoryList
        accessories={accessories}
        frameType={selectedBike?.frameType ?? null}
        quantities={quantities}
        onQuantityChange={handleQuantityChange}
      />
      {selectedBike ? (
        <>
          <BundleSummary totals={bundleTotals} />
          <button
            type="button"
            onClick={handleAddToCart}
            className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            {translate("addToCart")}
          </button>
        </>
      ) : null}
    </>
  );
}
