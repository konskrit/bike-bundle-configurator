"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { AccessoryList } from "@/components/AccessoryList";
import { BundleSummary } from "@/components/BundleSummary";
import { useCart } from "@/components/CartProvider";
import { Link, useRouter } from "@/i18n/navigation";
import { totals, type PriceLine } from "@/lib/pricing";
import type { Accessory, Bike } from "@/types/catalog";
import type { CartAccessoryLine } from "@/types/cart";
import type { StockLevels } from "@/types/stock";

type Props = {
  bike: Bike;
  accessories: Accessory[];
  stock: StockLevels | null;
  stockFailed?: boolean;
};

export function BikeConfigurator({
  bike,
  accessories,
  stock,
  stockFailed = false,
}: Props) {
  const translate = useTranslations("App");
  const format = useFormatter();
  const router = useRouter();
  const { addBundle } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [retrying, setRetrying] = useState(false);

  if (stockFailed || stock == null) {
    return (
      <div className="mt-8 space-y-4">
        <Link href="/" className="text-sm text-zinc-600 underline">
          {translate("backToBikes")}
        </Link>
        <p className="text-sm text-zinc-600" role="alert">
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
      </div>
    );
  }

  const bikeAvailable = stock[bike.id] ?? 0;
  const bikeInStock = bikeAvailable > 0;

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

  const priceLines: PriceLine[] = [
    {
      price: bike.price,
      taxRate: bike.taxRate,
      quantity: 1,
    },
    ...accessoryLines.map(({ accessory, quantity }) => ({
      price: accessory.price,
      taxRate: accessory.taxRate,
      quantity,
    })),
  ];
  const bundleTotals = totals(priceLines);

  function handleAddToCart() {
    if (!bikeInStock) {
      return;
    }

    addBundle({
      bike,
      accessories: accessoryLines,
      net: bundleTotals.net,
      gross: bundleTotals.gross,
    });
    setQuantities({});
  }

  return (
    <div className="mt-8">
      <Link href="/" className="text-sm text-zinc-600 underline">
        {translate("backToBikes")}
      </Link>

      <section className="mt-6 border-y border-zinc-200 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">{bike.name}</h1>
        <p className="mt-2 text-sm text-zinc-600">{bike.frameType}</p>
        <p className="mt-2 tabular-nums">
          {format.number(bike.price, { style: "currency", currency: "EUR" })}
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          {bikeInStock
            ? translate("stockInStock", { count: bikeAvailable })
            : translate("stockOutOfStock")}
        </p>
      </section>

      <AccessoryList
        accessories={accessories}
        frameType={bike.frameType}
        quantities={quantities}
        stock={stock}
        onQuantityChange={handleQuantityChange}
      />

      <BundleSummary totals={bundleTotals} />
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!bikeInStock}
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {translate("addToCart")}
      </button>
    </div>
  );
}
