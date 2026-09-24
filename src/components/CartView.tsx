"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CartBundleItem } from "@/components/CartBundleItem";
import { useCart } from "@/components/CartProvider";
import { useRouter } from "@/i18n/navigation";
import { requestCheckout } from "@/services/checkout";

type CheckoutFeedback =
  { type: "success"; message: string } | { type: "error"; message: string };

export function CartView() {
  const translate = useTranslations("App");
  const format = useFormatter();
  const router = useRouter();
  const { bundles, clearCart } = useCart();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<CheckoutFeedback | null>(null);
  const checkoutLock = useRef(false);

  async function handleCheckout() {
    if (checkoutLock.current || bundles.length === 0) {
      return;
    }

    checkoutLock.current = true;
    setPending(true);
    setFeedback(null);

    try {
      const result = await requestCheckout(bundles);

      if (!result.ok) {
        setFeedback({
          type: "error",
          message: translate(
            result.reason === "stock_unavailable"
              ? "stockUnavailable"
              : result.reason === "insufficient_stock"
                ? "checkoutErrorInsufficient"
                : "checkoutErrorGeneric",
          ),
        });
        return;
      }

      setFeedback({
        type: "success",
        message: translate("checkoutSuccess"),
      });
      clearCart();
      router.refresh();
    } finally {
      checkoutLock.current = false;
      setPending(false);
    }
  }

  if (bundles.length === 0) {
    return (
      <div className="mt-8 space-y-4 px-4">
        {feedback?.type === "success" ? (
          <p className="text-sm text-zinc-950" role="status">
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
          <CartBundleItem key={bundle.id} bundle={bundle} pending={pending} />
        ))}
      </ul>

      <section className="border-t border-zinc-200 px-4 pt-6">
        <h2 className="text-lg font-medium">{translate("cartSummary")}</h2>
        <dl className="mt-4 space-y-2 text-sm" aria-live="polite">
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
