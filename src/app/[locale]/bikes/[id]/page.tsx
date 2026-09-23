import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { BikeConfigurator } from "@/components/BikeConfigurator";
import { getAccessories, getBike } from "@/server/catalog";
import {
  StockServiceError,
  catalogStockLevels,
  withStockLatency,
} from "@/server/stock";
import type { Accessory, Bike } from "@/types/catalog";
import type { StockLevels } from "@/types/stock";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BikePage({ params }: Props) {
  const { id } = await params;
  const bike = getBike(id);

  if (!bike) {
    notFound();
  }

  const translate = await getTranslations("App");
  const accessories = getAccessories();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <Suspense
        fallback={
          <p className="mt-4 text-sm text-zinc-600">{translate("loading")}</p>
        }
      >
        <BikePageContent bike={bike} accessories={accessories} />
      </Suspense>
    </main>
  );
}

async function BikePageContent({
  bike,
  accessories,
}: {
  bike: Bike;
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
    <BikeConfigurator
      bike={bike}
      accessories={accessories}
      stock={stock}
      stockFailed={stockFailed}
    />
  );
}
