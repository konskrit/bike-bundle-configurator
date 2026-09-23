import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Configurator } from "@/components/Configurator";
import { getAccessories, getBikes } from "@/server/catalog";
import {
  StockServiceError,
  catalogStockLevels,
  withStockLatency,
} from "@/server/stock";
import type { Accessory, Bike } from "@/types/catalog";
import type { StockLevels } from "@/types/stock";

export default async function Home() {
  const translate = await getTranslations("App");
  const bikes = getBikes();
  const accessories = getAccessories();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {translate("title")}
      </h1>
      <Suspense
        fallback={
          <p className="mt-4 text-sm text-zinc-600">{translate("loading")}</p>
        }
      >
        <HomeConfigurator bikes={bikes} accessories={accessories} />
      </Suspense>
    </main>
  );
}

async function HomeConfigurator({
  bikes,
  accessories,
}: {
  bikes: Bike[];
  accessories: Accessory[];
}) {
  let stock: StockLevels | null = null;
  let stockFailed = false;

  try {
    const items = await withStockLatency(() => catalogStockLevels());
    stock = Object.fromEntries(items.map((item) => [item.id, item.available]));
  } catch (error) {
    if (!(error instanceof StockServiceError)) {
      throw error;
    }

    stockFailed = true;
  }

  return (
    <Configurator
      bikes={bikes}
      accessories={accessories}
      stock={stock}
      stockFailed={stockFailed}
    />
  );
}
