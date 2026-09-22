import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("App");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
    </main>
  );
}
