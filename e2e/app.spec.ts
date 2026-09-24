import { expect, test } from "@playwright/test";
import {
  cartAccessoryRow,
  checkoutUntilSuccess,
  clickCheckout,
  formatEur,
  mockStockOk,
  openBikeWithStock,
  removeCartAccessory,
  removeCartBundle,
  resetClientCart,
  setAccessoryQuantity,
  setCartAccessoryQuantity,
} from "./helpers";

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }) => {
  await resetClientCart(page);
});

test("configures accessories, quantities, and shows them in the cart", async ({
  page,
}) => {
  const addButton = await openBikeWithStock(
    page,
    "Touring Voyager 5.0",
    /\/en\/bikes\/bike-001/,
  );
  await expect(addButton).toBeEnabled();
  await expect(page.getByText(/Availability: \d+ in stock/)).toBeVisible();

  await setAccessoryQuantity(page, "Urban Pro Bike Helmet", 2);
  await setAccessoryQuantity(page, "SecureLock Chain Lock 12mm", 1);
  await addButton.click();
  await expect(page.getByText("Added to cart.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("(1)");

  await page.getByRole("link", { name: "Back to bikes" }).click();

  const secondAdd = await openBikeWithStock(
    page,
    "UrbanFlow City Step",
    /\/en\/bikes\/bike-007/,
  );
  await setAccessoryQuantity(page, "LED Light Set Front & Rear", 2);
  await secondAdd.click();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("(2)");

  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(page.getByText("Touring Voyager 5.0 bundle")).toBeVisible();
  await expect(page.getByText("UrbanFlow City Step bundle")).toBeVisible();
  await expect(
    page.getByLabel("Quantity for Urban Pro Bike Helmet"),
  ).toHaveValue("2");
  await expect(
    page.getByLabel("Quantity for SecureLock Chain Lock 12mm"),
  ).toHaveValue("1");
  await expect(
    page.getByLabel("Quantity for LED Light Set Front & Rear"),
  ).toHaveValue("2");
  await expect(
    cartAccessoryRow(page, "Urban Pro Bike Helmet").getByText(
      formatEur(79.9 * 2),
    ),
  ).toBeVisible();
});

test("edits accessory quantity in the cart and updates net line price", async ({
  page,
}) => {
  const addButton = await openBikeWithStock(
    page,
    "Touring Voyager 5.0",
    /\/en\/bikes\/bike-001/,
  );
  await setAccessoryQuantity(page, "Urban Pro Bike Helmet", 2);
  await addButton.click();

  await page.getByRole("link", { name: /Cart/ }).click();
  const row = cartAccessoryRow(page, "Urban Pro Bike Helmet");
  await expect(row.getByText(formatEur(159.8))).toBeVisible();

  await setCartAccessoryQuantity(page, "Urban Pro Bike Helmet", 3);
  await expect(row.getByText(formatEur(239.7))).toBeVisible();
  await expect(page.getByText(formatEur(899 + 239.7)).first()).toBeVisible();
});

test("removes a single accessory and drops bundle title when none remain", async ({
  page,
}) => {
  const addButton = await openBikeWithStock(
    page,
    "Touring Voyager 5.0",
    /\/en\/bikes\/bike-001/,
  );
  await setAccessoryQuantity(page, "Urban Pro Bike Helmet", 2);
  await setAccessoryQuantity(page, "Aluminum Bottle Cage", 1);
  await addButton.click();

  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(page.getByText("Touring Voyager 5.0 bundle")).toBeVisible();

  await removeCartAccessory(page, "Urban Pro Bike Helmet");
  await expect(
    page.getByLabel("Quantity for Urban Pro Bike Helmet"),
  ).toHaveCount(0);
  await expect(
    page.getByLabel("Quantity for Aluminum Bottle Cage"),
  ).toHaveValue("1");
  await expect(page.getByText("Touring Voyager 5.0 bundle")).toBeVisible();

  await removeCartAccessory(page, "Aluminum Bottle Cage");
  await expect(
    page.getByLabel("Quantity for Aluminum Bottle Cage"),
  ).toHaveCount(0);
  await expect(page.getByText("Touring Voyager 5.0 bundle")).toHaveCount(0);
  await expect(page.getByText("Touring Voyager 5.0")).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("(1)");
});

test("removes a whole bundle and clears the cart", async ({ page }) => {
  const firstAdd = await openBikeWithStock(
    page,
    "Touring Voyager 5.0",
    /\/en\/bikes\/bike-001/,
  );
  await firstAdd.click();

  await page.getByRole("link", { name: "Back to bikes" }).click();
  const secondAdd = await openBikeWithStock(
    page,
    "UrbanFlow City Step",
    /\/en\/bikes\/bike-007/,
  );
  await secondAdd.click();

  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("(2)");

  await removeCartBundle(page, "Touring Voyager 5.0");
  await expect(page.getByText("Touring Voyager 5.0")).toHaveCount(0);
  await expect(page.getByText("UrbanFlow City Step")).toBeVisible();
  await expect(page.getByRole("link", { name: /Cart/ })).toContainText("(1)");

  await page.getByRole("button", { name: "Clear cart" }).click();
  await expect(page.getByText("Your cart is empty.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Cart, 0 bundles" }),
  ).toBeVisible();
});

test("disables maxAmount-1 accessory slider in the cart", async ({ page }) => {
  const addButton = await openBikeWithStock(
    page,
    "Touring Voyager 5.0",
    /\/en\/bikes\/bike-001/,
  );
  await setAccessoryQuantity(page, "GPS Bike Computer Basic", 1);
  await addButton.click();

  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(
    page.getByLabel("Quantity for GPS Bike Computer Basic"),
  ).toBeDisabled();
  await expect(
    cartAccessoryRow(page, "GPS Bike Computer Basic").getByText(formatEur(89)),
  ).toBeVisible();
});

test("disables out-of-stock accessories on the configurator", async ({
  page,
}) => {
  await openBikeWithStock(page, "Touring Voyager 5.0", /\/en\/bikes\/bike-001/);

  const slider = page.getByLabel("Quantity for DuoComfort Child Trailer");
  await expect(slider).toBeDisabled();
  await expect(
    page
      .locator("li")
      .filter({ has: slider })
      .getByText("Out of stock", { exact: true }),
  ).toBeVisible();
});

test("disables add-to-cart when the bike is out of stock", async ({ page }) => {
  const addButton = await openBikeWithStock(
    page,
    "Speedline Carbon Race",
    /\/en\/bikes\/bike-003/,
  );

  await expect(page.getByText("Availability: Out of stock")).toBeVisible();
  await expect(addButton).toBeDisabled();
  await expect(
    page.getByLabel("Quantity for Urban Pro Bike Helmet"),
  ).toBeDisabled();
});

test("shows insufficient stock when cart exceeds available quantity", async ({
  page,
}) => {
  // bike-006 stock is 1; two bundles exceed it at checkout.
  for (let n = 0; n < 2; n += 1) {
    await page.goto("/en");
    const addButton = await openBikeWithStock(
      page,
      "Rockrider Enduro Pro",
      /\/en\/bikes\/bike-006/,
    );
    await expect(addButton).toBeEnabled();
    await addButton.click();
    await expect(page.getByText("Added to cart.")).toBeVisible();
  }

  await page.getByRole("link", { name: /Cart/ }).click();

  const insufficient = page.locator("p[role='alert']").filter({
    hasText: "Some items are not available in the requested quantity.",
  });
  const retryable = page.locator("p[role='alert']").filter({
    hasText: /Something went wrong|Checkout failed/,
  });

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await clickCheckout(page);
    await expect(insufficient.or(retryable)).toBeVisible({ timeout: 15_000 });

    if (await insufficient.isVisible().catch(() => false)) {
      await expect(page.getByText("Rockrider Enduro Pro")).toHaveCount(2);
      return;
    }
  }

  throw new Error("Never received insufficient stock error");
});

test("shows stock-service error and recovers after retry", async ({ page }) => {
  const addButton = await openBikeWithStock(
    page,
    "Touring Voyager 7.0 Deluxe",
    /\/en\/bikes\/bike-002/,
  );
  await addButton.click();
  await page.getByRole("link", { name: /Cart/ }).click();

  await page.route("**/api/stock", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "STOCK_SERVICE_FAILED" }),
    });
  });

  await clickCheckout(page);
  await expect(page.locator("p[role='alert']")).toHaveText(
    "Something went wrong. Please try again.",
  );
  await expect(page.getByText("Touring Voyager 7.0 Deluxe")).toBeVisible();

  await page.unroute("**/api/stock");
  await mockStockOk(page, [
    { id: "bike-002", available: 2, requested: 1, ok: true },
  ]);

  await clickCheckout(page);
  await expect(
    page.getByRole("status").filter({
      hasText: "Order placed successfully.",
    }),
  ).toBeVisible();
});

test("shows generic error when checkout request fails", async ({ page }) => {
  const addButton = await openBikeWithStock(
    page,
    "Speedline Aero Disc",
    /\/en\/bikes\/bike-004/,
  );
  await addButton.click();
  await page.getByRole("link", { name: /Cart/ }).click();

  await page.route("**/api/stock", async (route) => {
    await route.abort("failed");
  });

  await clickCheckout(page);
  await expect(page.locator("p[role='alert']")).toHaveText(
    "Checkout failed. Please try again.",
  );
  await expect(page.getByText("Speedline Aero Disc")).toBeVisible();
});

test("configures a bundle with accessories and completes checkout", async ({
  page,
}) => {
  const addButton = await openBikeWithStock(
    page,
    "Touring Voyager 5.0",
    /\/en\/bikes\/bike-001/,
  );
  await setAccessoryQuantity(page, "Aluminum Bottle Cage", 2);
  await setAccessoryQuantity(page, "Compact Puncture Repair Kit", 1);
  await addButton.click();

  await page.getByRole("link", { name: /Cart/ }).click();
  await expect(
    page.getByLabel("Quantity for Aluminum Bottle Cage"),
  ).toHaveValue("2");
  await expect(
    page.getByLabel("Quantity for Compact Puncture Repair Kit"),
  ).toHaveValue("1");
  await expect(
    cartAccessoryRow(page, "Aluminum Bottle Cage").getByText(formatEur(25.8)),
  ).toBeVisible();

  await mockStockOk(page, [
    { id: "bike-001", available: 4, requested: 1, ok: true },
    { id: "acc-005", available: 2, requested: 2, ok: true },
    { id: "acc-006", available: 3, requested: 1, ok: true },
  ]);

  await checkoutUntilSuccess(page);
  await expect(
    page.getByRole("link", { name: "Cart, 0 bundles" }),
  ).toBeVisible();
});
