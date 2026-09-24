"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { netAmount } from "@/lib/pricing";
import type { CartBundle } from "@/types/cart";

type Props = {
  bundle: CartBundle;
  pending: boolean;
};

export function CartBundleItem({ bundle, pending }: Props) {
  const translate = useTranslations("App");
  const translateAccessory = useTranslations("Accessories");
  const frameTypes = useTranslations("FrameTypes");
  const format = useFormatter();
  const { removeBundle, updateAccessoryQuantity } = useCart();
  const hasAccessories = bundle.accessories.length > 0;

  return (
    <li className="px-4 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">
            {hasAccessories
              ? translate("cartBundleTitle", { name: bundle.bike.name })
              : bundle.bike.name}
          </p>
          <p className="text-sm text-zinc-600">
            {frameTypes(bundle.bike.frameType)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => removeBundle(bundle.id)}
          disabled={pending}
          className="shrink-0 text-sm text-zinc-600 underline disabled:opacity-60"
        >
          {translate("cartRemove")}
        </button>
      </div>

      {hasAccessories ? (
        <ul className="mt-2 space-y-3 text-sm text-zinc-600">
          <li className="flex justify-between gap-4">
            <span>{bundle.bike.name}</span>
            <span className="tabular-nums">
              {format.number(bundle.bike.price, {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </li>
          {bundle.accessories.map(({ accessory, quantity }) => {
            const name = translateAccessory(accessory.id);

            return (
              <li key={accessory.id} className="space-y-2">
                <div className="flex justify-between gap-4">
                  <span>{name}</span>
                  <span className="tabular-nums">
                    {format.number(netAmount(accessory.price, quantity), {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-3">
                    <span className="sr-only">
                      {translate("quantityLabel", { name })}
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={accessory.maxAmount}
                      step={1}
                      value={quantity}
                      disabled={pending || accessory.maxAmount <= 1}
                      onChange={(event) =>
                        updateAccessoryQuantity(
                          bundle.id,
                          accessory.id,
                          Number(event.target.value),
                        )
                      }
                    />
                    <span className="w-8 tabular-nums" aria-hidden="true">
                      {quantity}
                    </span>
                  </label>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      updateAccessoryQuantity(bundle.id, accessory.id, 0)
                    }
                    className="shrink-0 underline disabled:opacity-60"
                  >
                    {translate("cartRemove")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-600">{translate("netTotal")}</dt>
          <dd className="tabular-nums">
            {format.number(bundle.net, {
              style: "currency",
              currency: "EUR",
            })}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-600">{translate("grossTotal")}</dt>
          <dd className="font-medium tabular-nums">
            {format.number(bundle.gross, {
              style: "currency",
              currency: "EUR",
            })}
          </dd>
        </div>
      </dl>
    </li>
  );
}
