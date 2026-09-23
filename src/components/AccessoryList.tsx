"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Accessory, FrameType } from "@/types/catalog";
import type { StockLevels } from "@/types/stock";

type Props = {
  accessories: Accessory[];
  frameType: FrameType | null;
  quantities: Record<string, number>;
  stock: StockLevels;
  onQuantityChange: (accessoryId: string, quantity: number) => void;
};

export function AccessoryList({
  accessories,
  frameType,
  quantities,
  stock,
  onQuantityChange,
}: Props) {
  const translate = useTranslations("App");
  const format = useFormatter();

  const compatible = frameType
    ? accessories.filter((accessory) =>
        accessory.compatibleFrameTypes.includes(frameType),
      )
    : [];

  return (
    <section className="mt-10" aria-labelledby="accessories-heading">
      <h2 id="accessories-heading" className="text-lg font-medium">
        {translate("accessoriesHeading")}
      </h2>

      {!frameType ? (
        <p className="mt-4 text-sm text-zinc-600">
          {translate("selectBikeForAccessories")}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
          {compatible.map((accessory) => {
            const quantity = quantities[accessory.id] ?? 0;
            const available = stock[accessory.id] ?? 0;
            const max = Math.min(accessory.maxAmount, available);

            return (
              <li
                key={accessory.id}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{accessory.name}</p>
                  <p className="shrink-0 text-sm text-zinc-600 tabular-nums">
                    {format.number(accessory.price, {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                  {available > 0 ? (
                    <p className="mt-1 text-sm text-zinc-600">
                      {translate("stockInStock", { count: available })}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-zinc-600">
                      {translate("stockOutOfStock")}
                    </p>
                  )}
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <span className="sr-only">
                    {translate("quantityLabel", { name: accessory.name })}
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
                  <span className="w-8 tabular-nums">
                    {Math.min(quantity, max)}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
