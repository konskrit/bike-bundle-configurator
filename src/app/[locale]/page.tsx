import { getTranslations } from "next-intl/server";
import { BikePicker } from "@/components/BikePicker";
import { getBikes } from "@/server/catalog";

export default async function Home() {
  const translate = await getTranslations("App");
  const bikes = getBikes();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {translate("title")}
      </h1>
      <BikePicker bikes={bikes} />
    </main>
  );
}
