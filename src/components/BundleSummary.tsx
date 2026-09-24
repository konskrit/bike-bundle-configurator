"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { MoneyTotals } from "@/lib/pricing";

type Props = {
  totals: MoneyTotals;
};

export function BundleSummary({ totals }: Props) {
  const translate = useTranslations("App");
  const format = useFormatter();

  return (
    <section className="mt-10 border-t border-zinc-200 px-4 pt-6">
      <h2 className="text-lg font-medium">{translate("bundleSummary")}</h2>
      <dl className="mt-4 space-y-2 text-sm" aria-live="polite">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-600">{translate("netTotal")}</dt>
          <dd className="font-medium tabular-nums">
            {format.number(totals.net, { style: "currency", currency: "EUR" })}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-600">{translate("grossTotal")}</dt>
          <dd className="font-medium tabular-nums">
            {format.number(totals.gross, {
              style: "currency",
              currency: "EUR",
            })}
          </dd>
        </div>
      </dl>
    </section>
  );
}
