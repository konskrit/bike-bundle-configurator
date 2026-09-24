import { getTranslations } from "next-intl/server";
import { CartView } from "@/components/CartView";
import { PageShell } from "@/components/PageShell";

export default async function CartPage() {
  const translate = await getTranslations("App");

  return (
    <PageShell title={translate("cartTitle")}>
      <CartView />
    </PageShell>
  );
}
