"use client";

import { useState } from "react";
import { AccessoryList } from "@/components/AccessoryList";
import { BikePicker } from "@/components/BikePicker";
import { BundleSummary } from "@/components/BundleSummary";
import { totals, type PriceLine } from "@/lib/pricing";
import type { Accessory, Bike } from "@/types/catalog";

type Props = {
  bikes: Bike[];
  accessories: Accessory[];
};

export function Configurator({ bikes, accessories }: Props) {
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

  const priceLines: PriceLine[] = [];

  if (selectedBike) {
    priceLines.push({
      price: selectedBike.price,
      taxRate: selectedBike.taxRate,
      quantity: 1,
    });

    for (const [accessoryId, quantity] of Object.entries(quantities)) {
      if (quantity <= 0) {
        continue;
      }

      const accessory = accessories.find((item) => item.id === accessoryId);
      if (!accessory) {
        continue;
      }

      priceLines.push({
        price: accessory.price,
        taxRate: accessory.taxRate,
        quantity,
      });
    }
  }

  const bundleTotals = totals(priceLines);

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
      {selectedBike ? <BundleSummary totals={bundleTotals} /> : null}
    </>
  );
}
