import { getFormatter, getTranslations } from "next-intl/server";
import { getBikes } from "@/server/catalog";

export default async function Home() {
  const translate = await getTranslations("App");
  const format = await getFormatter();
  const bikes = getBikes();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">
        {translate("title")}
      </h1>

      <section className="mt-8" aria-labelledby="bikes-heading">
        <h2 id="bikes-heading" className="text-lg font-medium">
          {translate("bikesHeading")}
        </h2>
        <ul className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200">
          {bikes.map((bike) => (
            <li
              key={bike.id}
              className="flex items-baseline justify-between gap-4 py-3"
            >
              <div>
                <p className="font-medium">{bike.name}</p>
                <p className="text-sm text-zinc-600">{bike.frameType}</p>
              </div>
              <p className="shrink-0 tabular-nums">
                {format.number(bike.price, {
                  style: "currency",
                  currency: "EUR",
                })}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
