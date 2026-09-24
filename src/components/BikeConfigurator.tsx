"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { AccessoryList } from "@/components/AccessoryList";
import { BundleSummary } from "@/components/BundleSummary";
import { useCart } from "@/components/CartProvider";
import { Link, useRouter } from "@/i18n/navigation";
import { bundleTotals } from "@/lib/pricing";
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
  const frameTypes = useTranslations("FrameTypes");
  const format = useFormatter();
  const router = useRouter();
  const { addBundle } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState(false);
  const addingLock = useRef(false);

  if (stockFailed || stock == null) {
    return (
      <div className="mt-8 space-y-4">
        <Link href="/" className="text-sm text-zinc-600 underline">
          {translate("backToBikes")}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">{bike.name}</h1>
        <p className="text-sm text-zinc-600" role="alert">
          {translate("stockUnavailable")}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => {
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
    if (quantity <= 0 || !bikeInStock) {
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

  const money = bundleTotals(bike, accessoryLines);

  function handleAddToCart() {
    if (!bikeInStock || addingLock.current) {
      return;
    }

    addingLock.current = true;
    addBundle({
      bike,
      accessories: accessoryLines,
      net: money.net,
      gross: money.gross,
    });
    setQuantities({});
    setAddedToCart(true);
    window.setTimeout(() => {
      addingLock.current = false;
    }, 400);
    window.setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  }

  return (
    <div className="mt-8">
      <Link href="/" className="text-sm text-zinc-600 underline">
        {translate("backToBikes")}
      </Link>

      <section className="mt-6 border-y border-zinc-200 px-4 py-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {bike.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-600">
              {frameTypes(bike.frameType)}
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              {translate("stockAvailability", {
                status: bikeInStock
                  ? translate("stockInStock", { count: bikeAvailable })
                  : translate("stockOutOfStock"),
              })}
            </p>
          </div>
          <p className="shrink-0 text-xl font-medium tabular-nums">
            {format.number(bike.price, {
              style: "currency",
              currency: "EUR",
            })}
          </p>
        </div>
      </section>

      <AccessoryList
        accessories={accessories}
        quantities={quantities}
        stock={stock}
        disabled={!bikeInStock}
        onQuantityChange={handleQuantityChange}
      />

      <BundleSummary totals={money} />
      <div className="mt-4 flex flex-col items-end gap-2 px-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!bikeInStock}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {translate("addToCart")}
        </button>
        {addedToCart ? (
          <p className="text-sm text-zinc-600" role="status">
            {translate("addToCartSuccess")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
