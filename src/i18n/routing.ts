import { defineRouting } from "next-intl/routing";
import { DEFAULT_LANGUAGE, LOCALES } from "./languages";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LANGUAGE,
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
