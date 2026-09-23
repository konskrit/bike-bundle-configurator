"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, type Language } from "@/i18n/languages";

export function LocaleSwitcher() {
  const translate = useTranslations("App");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label={translate("languageLabel")}
      value={locale}
      onChange={(event) => {
        router.replace(pathname, { locale: event.target.value as Language });
      }}
    >
      {LOCALES.map((value) => (
        <option key={value} value={value}>
          {value.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
