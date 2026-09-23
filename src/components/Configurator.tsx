"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { AccessoryList } from "@/components/AccessoryList";
import { BikePicker } from "@/components/BikePicker";
import { BundleSummary } from "@/components/BundleSummary";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "@/i18n/navigation";
import { totals, type PriceLine } from "@/lib/pricing";
import type { Accessory, Bike } from "@/types/catalog";
import type { CartAccessoryLine } from "@/types/cart";
import type { StockLevels } from "@/types/stock";

type Props = {
  bikes: Bike[];
  accessories: Accessory[];
  stock: StockLevels | null;
  stockFailed?: boolean;
};

export function Configurator({
  bikes,
  accessories,
  stock,
  stockFailed = false,
}: Props) {
  const translate = useTranslations("App");
  const router = useRouter();
  const { addBundle } = useCart();
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [retrying, setRetrying] = useState(false);

  if (stockFailed || stock == null) {
    return (
      <p className="mt-4 text-sm text-zinc-600" role="alert">
        {translate("stockUnavailable")}{" "}
        <button
          type="button"
          className="underline"
          disabled={retrying}
          onClick={() => {
            setRetrying(true);
            router.refresh();
          }}
        >
          {translate("stockRetry")}
        </button>
      </p>
    );
  }

  const activeBikeId =
    selectedBikeId != null && (stock[selectedBikeId] ?? 0) <= 0
      ? null
      : selectedBikeId;
  const selectedBike = bikes.find((bike) => bike.id === activeBikeId) ?? null;

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

    const capped = Math.min(
      quantity,
      accessory.maxAmount,
      stock[accessoryId] ?? 0,
    );
    if (capped <= 0) {
      continue;
    }

    accessoryLines.push({ accessory, quantity: capped });
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
  const bikeInStock = selectedBike != null && (stock[selectedBike.id] ?? 0) > 0;

  function handleAddToCart() {
    if (!selectedBike || !bikeInStock) {
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
        selectedBikeId={activeBikeId}
        stock={stock}
        onSelect={handleSelectBike}
      />
      <AccessoryList
        accessories={accessories}
        frameType={selectedBike?.frameType ?? null}
        quantities={quantities}
        stock={stock}
        onQuantityChange={handleQuantityChange}
      />
      {selectedBike ? (
        <>
          <BundleSummary totals={bundleTotals} />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!bikeInStock}
            className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {translate("addToCart")}
          </button>
        </>
      ) : null}
    </>
  );
}
