"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { Bike } from "@/types/catalog";

type Props = {
  bikes: Bike[];
  selectedBikeId: string | null;
  onSelect: (bikeId: string) => void;
};

export function BikePicker({ bikes, selectedBikeId, onSelect }: Props) {
  const translate = useTranslations("App");
  const format = useFormatter();

  return (
    <section className="mt-8" aria-labelledby="bikes-heading">
      <h2 id="bikes-heading" className="text-lg font-medium">
        {translate("bikesHeading")}
      </h2>
      <ul
        className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200"
        role="listbox"
        aria-label={translate("selectBike")}
      >
        {bikes.map((bike) => {
          const selected = bike.id === selectedBikeId;

          return (
            <li key={bike.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect(bike.id)}
                className={`flex w-full items-baseline justify-between gap-4 py-3 text-left ${
                  selected ? "bg-zinc-100" : "hover:bg-zinc-50"
                }`}
              >
                <div>
                  <p className="font-medium">{bike.name}</p>
                  <p className="text-sm text-zinc-600">{bike.frameType}</p>
                </div>
                <p className="shrink-0 tabular-nums">
                  {format.number(bike.price, {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
