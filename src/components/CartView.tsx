"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "@/i18n/navigation";
import { requestCheckout } from "@/services/checkout";

type CheckoutFeedback =
  { type: "success"; message: string } | { type: "error"; message: string };

export function CartView() {
  const translate = useTranslations("App");
  const format = useFormatter();
  const router = useRouter();
  const { bundles, removeBundle, clearCart } = useCart();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<CheckoutFeedback | null>(null);

  async function handleCheckout() {
    if (pending || bundles.length === 0) {
      return;
    }

    setPending(true);
    setFeedback(null);

    try {
      const result = await requestCheckout(bundles);

      if (!result.ok) {
        setFeedback({
          type: "error",
          message: translate(
            result.reason === "stock_unavailable"
              ? "checkoutErrorStock"
              : result.reason === "insufficient_stock"
                ? "checkoutErrorInsufficient"
                : "checkoutErrorGeneric",
          ),
        });
        return;
      }

      clearCart();
      router.refresh();
      setFeedback({
        type: "success",
        message: translate("checkoutSuccess"),
      });
    } finally {
      setPending(false);
    }
  }

  if (bundles.length === 0) {
    return (
      <div className="mt-8 space-y-4 px-4">
        {feedback?.type === "success" ? (
          <p className="text-sm text-zinc-950" role="status" aria-live="polite">
            {feedback.message}
          </p>
        ) : (
          <p className="text-sm text-zinc-600">{translate("cartEmpty")}</p>
        )}
      </div>
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
      <div className="flex justify-end px-4">
        <button
          type="button"
          onClick={clearCart}
          disabled={pending}
          className="text-sm text-zinc-600 underline disabled:opacity-60"
        >
          {translate("cartClear")}
        </button>
      </div>

      <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
        {bundles.map((bundle) => (
          <li key={bundle.id} className="px-4 py-4">
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
                disabled={pending}
                className="shrink-0 text-sm text-zinc-600 underline disabled:opacity-60"
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

      <section
        className="border-t border-zinc-200 px-4 pt-6"
        aria-live="polite"
      >
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

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCheckout}
            disabled={pending}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? translate("checkoutPending") : translate("checkout")}
          </button>
        </div>

        {feedback?.type === "error" ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {feedback.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}
