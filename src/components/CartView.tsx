"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";

export function CartView() {
  const translate = useTranslations("App");
  const format = useFormatter();
  const { bundles, removeBundle, clearCart } = useCart();

  if (bundles.length === 0) {
    return (
      <p className="mt-8 text-sm text-zinc-600">{translate("cartEmpty")}</p>
    );
  }

  const cartTotals = bundles.reduce(
    (acc, bundle) => ({
      net: acc.net + bundle.net,
      gross: acc.gross + bundle.gross,
    }),
    { net: 0, gross: 0 },
  );

  return (
    <div className="mt-8 space-y-8">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-zinc-600 underline"
        >
          {translate("cartClear")}
        </button>
      </div>

      <ul className="space-y-6">
        {bundles.map((bundle) => (
          <li key={bundle.id} className="border-y border-zinc-200 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{bundle.bike.name}</p>
                <p className="text-sm text-zinc-600">{bundle.bike.frameType}</p>
                {bundle.accessories.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                    {bundle.accessories.map(({ accessory, quantity }) => (
                      <li key={accessory.id}>
                        {accessory.name} × {quantity}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => removeBundle(bundle.id)}
                className="shrink-0 text-sm text-zinc-600 underline"
              >
                {translate("cartRemove")}
              </button>
            </div>
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
        ))}
      </ul>

      <section className="border-t border-zinc-200 pt-6" aria-live="polite">
        <h2 className="text-lg font-medium">{translate("cartSummary")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600">{translate("netTotal")}</dt>
            <dd className="font-medium tabular-nums">
              {format.number(cartTotals.net, {
                style: "currency",
                currency: "EUR",
              })}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-600">{translate("grossTotal")}</dt>
            <dd className="font-medium tabular-nums">
              {format.number(cartTotals.gross, {
                style: "currency",
                currency: "EUR",
              })}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
