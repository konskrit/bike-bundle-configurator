"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/components/CartProvider";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Link, usePathname } from "@/i18n/navigation";

export function SiteHeader() {
  const translate = useTranslations("App");
  const { bundles } = useCart();
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-4 py-3">
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/"
          className={
            pathname === "/" ? "font-medium text-zinc-950" : "text-zinc-600"
          }
        >
          {translate("navConfigurator")}
        </Link>
        <Link
          href="/cart"
          className={
            pathname === "/cart" ? "font-medium text-zinc-950" : "text-zinc-600"
          }
        >
          {translate("navCart")}
          {bundles.length > 0 ? ` (${bundles.length})` : null}
        </Link>
      </nav>
      <LocaleSwitcher />
    </header>
  );
}
