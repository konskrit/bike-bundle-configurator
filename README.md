# Bike Bundle Configurator

BIKE24 take-home. You pick a bike, get compatible accessories, build a priced bundle, keep it in a cart across pages, and check out against a stock service that is intentionally slow and flaky.

## Run

```bash
npm install
npx playwright install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run test:run
npm run test:e2e
```

`test:run` is Vitest. `test:e2e` builds the app and runs Playwright on port 3001.

After heavy manual checkouts, restart the Next process to reset demo inventory.

## How it is put together

Catalog and initial inventory live under `data/` (`bikes.json`, `accessories.json`, `stock.json`). Catalog JSON is loaded on the server (`server-only`). Compatible accessories are filtered by frame type on the server before the client configurator renders, so wrong frame types never show up as selectable.

Pages for the bike list and detail shell are Server Components. The configurator, cart, and header are Client Components where interaction and cart state live. In the cart you can change accessory quantities, remove a single accessory, remove a whole bundle, or clear everything.

Checkout goes through `POST /api/stock`, which validates the body, reserves inventory, and returns 400, 409, or 503 as needed.

The cart sits in the browser with `localStorage` and `useSyncExternalStore`, so moving between configurator and cart does not drop bundles and SSR stays hydration safe.

Stock is an in-memory copy of `data/stock.json` on the Node process, with artificial latency and about a 10% failure rate. The bike detail page reads levels for display (that read can fail too; the UI offers Retry); the bike list stays catalog only so it does not wait on the slow stock service. Reservation happens at checkout, not on add to cart. Checkout maps stock service down (503), insufficient quantity (409), and network failure to clear messages.

## Stock vs cart

On the configurator, accessory quantity is capped by live stock and `maxAmount`. In the cart, edits only respect `maxAmount`. That is intentional. If the cart also blocked oversell, the “insufficient stock” checkout path would barely show up in a local demo (for example two bundles of a bike that only has stock 1). A production app would share inventory or reservations; here the failure path is meant to be easy to hit and review.

## Bonuses

Race conditions: add to cart and checkout use ref locks so double submits do not run twice. These guards are client side; the in-memory reserve is not atomic across concurrent requests, which a real inventory service would handle inside a transaction.

i18n: EN and DE for UI chrome, accessory names, frame types, and locale formatted EUR prices, switchable in the header. Bike names are left in the catalog language on purpose (brand/model strings from `data/bikes.json` do not change by locale).

A11y: labeled native range sliders (keyboard operable), `aria-live` on cart and bundle totals, and alert roles on errors. A product type progress indicator was not built because the max 10 types bonus was skipped.

Optimistic UI was skipped. Add stays local; stock is enforced at checkout, without a stock check and rollback on add.

Caching / ISR for the catalog was skipped. The detail page needs live stock, so it is `force-dynamic` instead of ISR or tag revalidation.

Max 10 product types with a progress UI was skipped for time. The cart stays small without that cap.

Inventory stays in process memory only. That is enough to show flaky reserve and errors; it is not a multi instance store.

`POST /api/stock` validates the body shape (including rejecting an empty `items` list) but not catalog membership, `maxAmount`, or auth. In production, reservation would run against a server side order instead of a client supplied item list.

Prices are plain JS numbers formatted with `Intl`; production would store integer cents. The cart keeps a snapshot of products and totals in `localStorage` and checkout does not reprice; a real checkout would reprice from the server catalog.

## Libraries

Next.js App Router is required and drives the RSC / client / route handler split.

`next-intl` covers locale routing and messages without a custom i18n stack.

Vitest covers pricing, cart helpers, in memory stock check and reserve, checkout status mapping, and the stock route handler.

Playwright covers real flows against a production build: cart edits, out of stock UI, and checkout outcomes with `POST /api/stock` mocked for success, insufficient stock (409), 503, and network failure so CI stays deterministic and re runs do not eat inventory.

No Redux or similar. The cart is small enough for a module store plus React context.

## Deploy sketch

I would deploy on Vercel (or another Node host that supports the App Router and Route Handlers). Preview deployments per PR, production on `master`.

Caching: static assets and the mostly static catalog can use the CDN edge cache. Bike detail and checkout must stay dynamic because they depend on live stock. In a fuller setup I would cache catalog reads with a short TTL or tag based revalidation, and never cache reservation responses. Today the detail page is `force-dynamic` for that reason.

Environment variables: this demo needs none. On a real cloud deploy I would use something like `STOCK_SERVICE_URL` and `STOCK_SERVICE_API_KEY` (or cloud secret store) for an external inventory API, plus the usual `NODE_ENV` / platform defaults. No secrets in the repo; map them in the host’s project settings and keep preview vs production values separate.

Rollback: each deploy is an immutable build. If production misbehaves, promote or redeploy the previous known good deployment in the host UI (Vercel instant rollback). Because demo stock is in process memory, a restart or new instance resets inventory; a real service would keep stock outside the web app so rollback of the UI does not wipe warehouse state.

## Tests

Units cover net/gross pricing, cart accessory updates, stock check and reserve (including duplicate ids), `requestCheckout` status mapping, and `POST /api/stock` validation plus reserve and 409.

E2E covers configure, cart edit and remove, out of stock controls, and checkout UI for success, insufficient stock, stock service down, and network errors (`POST /api/stock` mocked for those status paths).
