import { getFormatter, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Bike } from "@/types/catalog";

type Props = {
  bikes: Bike[];
};

export async function BikeList({ bikes }: Props) {
  const translate = await getTranslations("App");
  const format = await getFormatter();

  return (
    <section className="mt-8" aria-labelledby="bikes-heading">
      <h2 id="bikes-heading" className="text-lg font-medium">
        {translate("bikesHeading")}
      </h2>
      <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
        {bikes.map((bike) => (
          <li key={bike.id}>
            <Link
              href={`/bikes/${bike.id}`}
              className="flex w-full items-baseline justify-between gap-4 py-3 hover:bg-zinc-50"
            >
              <p className="font-medium">{bike.name}</p>
              <p className="shrink-0 tabular-nums">
                {format.number(bike.price, {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
