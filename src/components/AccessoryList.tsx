"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Accessory } from "@/types/catalog";
import type { StockLevels } from "@/types/stock";

type Props = {
  accessories: Accessory[];
  quantities: Record<string, number>;
  stock: StockLevels;
  disabled?: boolean;
  onQuantityChange: (accessoryId: string, quantity: number) => void;
};

export function AccessoryList({
  accessories,
  quantities,
  stock,
  disabled = false,
  onQuantityChange,
}: Props) {
  const translate = useTranslations("App");
  const translateAccessory = useTranslations("Accessories");
  const format = useFormatter();

  return (
    <section className="mt-10" aria-labelledby="accessories-heading">
      <h2 id="accessories-heading" className="px-4 text-lg font-medium">
        {translate("accessoriesHeading")}
      </h2>
      <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
        {accessories.map((accessory) => {
          const quantity = quantities[accessory.id] ?? 0;
          const available = stock[accessory.id] ?? 0;
          const max = disabled ? 0 : Math.min(accessory.maxAmount, available);
          const name = translateAccessory(accessory.id);

          return (
            <li
              key={accessory.id}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{name}</p>
                <p className="shrink-0 text-sm text-zinc-600 tabular-nums">
                  {format.number(accessory.price, {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  {available > 0
                    ? translate("stockInStock", { count: available })
                    : translate("stockOutOfStock")}
                </p>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <span className="sr-only">
                  {translate("quantityLabel", { name })}
                </span>
                <input
                  type="range"
                  min={0}
                  max={max}
                  step={1}
                  value={Math.min(quantity, max)}
                  disabled={max === 0}
                  onChange={(event) =>
                    onQuantityChange(accessory.id, Number(event.target.value))
                  }
                />
                <span className="w-8 tabular-nums" aria-hidden="true">
                  {Math.min(quantity, max)}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
