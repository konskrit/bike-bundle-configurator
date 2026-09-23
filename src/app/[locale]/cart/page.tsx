import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/CartView";

export default async function CartPage() {
  const translate = await getTranslations("App");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {translate("cartTitle")}
      </h1>
      <CartView />
    </main>
  );
}
