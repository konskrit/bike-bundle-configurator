import { getTranslations } from "next-intl/server";
import { BikeList } from "@/components/BikeList";
import { PageShell } from "@/components/PageShell";
import { getBikes } from "@/server/catalog";

export default async function Home() {
  const translate = await getTranslations("App");

  return (
    <PageShell title={translate("title")}>
      <BikeList bikes={getBikes()} />
    </PageShell>
  );
}
