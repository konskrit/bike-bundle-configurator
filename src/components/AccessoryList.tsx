"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Accessory, FrameType } from "@/types/catalog";

type Props = {
  accessories: Accessory[];
  frameType: FrameType | null;
};

export function AccessoryList({ accessories, frameType }: Props) {
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
          {compatible.map((accessory) => (
            <li
              key={accessory.id}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <p className="font-medium">{accessory.name}</p>
              <p className="shrink-0 tabular-nums">
                {format.number(accessory.price, {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
