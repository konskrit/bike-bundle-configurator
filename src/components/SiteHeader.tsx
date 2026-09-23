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
    <header className="flex items-center gap-6 border-b border-zinc-200 px-6 py-3">
      <nav className="flex items-center gap-4 text-sm">
        <Link
          href="/"
          className={
            pathname === "/" || pathname.startsWith("/bikes")
              ? "font-medium text-zinc-950"
              : "text-zinc-600"
          }
        >
          {translate("navConfigurator")}
        </Link>
      </nav>
      <div className="ml-auto flex items-center gap-6">
        <LocaleSwitcher />
        <Link
          href="/cart"
          aria-label={translate("navCartLabel", { count: bundles.length })}
          className={
            pathname === "/cart"
              ? "text-sm font-medium text-zinc-950"
              : "text-sm text-zinc-600"
          }
        >
          {translate("navCart")}
          {bundles.length > 0 ? ` (${bundles.length})` : null}
        </Link>
      </div>
    </header>
  );
}
