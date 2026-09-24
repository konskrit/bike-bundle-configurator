import { expect, type Locator, type Page } from "@playwright/test";

export function formatEur(amount: number) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export async function resetClientCart(page: Page) {
  await page.goto("/en");
  await page.evaluate(() => {
    localStorage.removeItem("bike-bundle-cart");
  });
  await page.reload();
}

export async function openBikeWithStock(
  page: Page,
  bikeName: string,
  urlPattern: RegExp,
) {
  await page.getByRole("link", { name: bikeName }).click();
  await expect(page).toHaveURL(urlPattern);

  const addButton = page.getByRole("button", { name: "Add bundle to cart" });
  const retry = page.getByRole("button", { name: "Retry" });

  for (let attempt = 0; attempt < 15; attempt += 1) {
    await expect(addButton.or(retry)).toBeVisible({ timeout: 15_000 });

    if (await addButton.isVisible()) {
      return addButton;
    }

    await retry.click();
    try {
      await expect(addButton).toBeVisible({ timeout: 15_000 });
      return addButton;
    } catch {
      continue;
    }
  }

  throw new Error(`Stock never loaded for ${bikeName}`);
}

export async function setAccessoryQuantity(
  page: Page,
  accessoryName: string,
  quantity: number,
) {
  const slider = page.getByLabel(`Quantity for ${accessoryName}`);
  await slider.fill(String(quantity));
  await expect(slider).toHaveValue(String(quantity));
}

export function cartAccessoryRow(page: Page, accessoryName: string): Locator {
  return page.locator("li.space-y-2").filter({
    has: page.getByLabel(`Quantity for ${accessoryName}`),
  });
}

export async function setCartAccessoryQuantity(
  page: Page,
  accessoryName: string,
  quantity: number,
) {
  const slider = page.getByLabel(`Quantity for ${accessoryName}`);
  await expect(slider).toBeEnabled();
  await slider.fill(String(quantity));
  await expect(slider).toHaveValue(String(quantity));
}

export async function removeCartAccessory(page: Page, accessoryName: string) {
  await cartAccessoryRow(page, accessoryName)
    .getByRole("button", { name: "Remove" })
    .click();
}

export async function removeCartBundle(page: Page, bikeName: string) {
  const bundle = page.locator("ul.divide-y > li").filter({ hasText: bikeName });
  await bundle.getByRole("button", { name: "Remove" }).first().click();
}

export async function checkoutUntilSuccess(page: Page) {
  const success = page.getByRole("status").filter({
    hasText: "Order placed successfully.",
  });
  const retryableError = page.locator("p[role='alert']").filter({
    hasText: /Something went wrong|Checkout failed/,
  });
  const checkout = page.getByRole("button", { name: "Checkout" });

  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (await success.isVisible().catch(() => false)) {
      return;
    }

    await expect(checkout).toBeEnabled({ timeout: 5_000 });
    await checkout.click();

    await expect(success.or(retryableError)).toBeVisible({ timeout: 15_000 });

    if (await success.isVisible().catch(() => false)) {
      return;
    }
  }

  throw new Error("Checkout never succeeded");
}

export async function clickCheckout(page: Page) {
  const checkout = page.getByRole("button", { name: "Checkout" });
  await expect(checkout).toBeEnabled();
  await checkout.click();
}

export async function mockStockOk(
  page: Page,
  items: { id: string; available: number; requested: number; ok: boolean }[],
) {
  await page.route("**/api/stock", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ items }),
    });
  });
}
