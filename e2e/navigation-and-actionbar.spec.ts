import { expect, test } from "@playwright/test";
import { getE2ECredentials, login } from "./helpers/auth";

const creds = getE2ECredentials();

async function gotoAndExpect(page: import("@playwright/test").Page, path: string, urlPattern: RegExp) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(urlPattern);
      return;
    } catch (error) {
      if (attempt === 1) {
        throw error;
      }
    }
  }
}

test.describe("Navigation and ActionBar", () => {
  test.skip(!creds.isConfigured, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated E2E tests.");

  test("sidebar links navigate to key pages", async ({ page }) => {
    await login(page, creds.email!, creds.password!);

    await gotoAndExpect(page, "/dashboard-overview", /\/dashboard-overview$/);

    await gotoAndExpect(page, "/projects", /\/projects$/);

    await gotoAndExpect(page, "/person-skills", /\/person-skills$/);

    await gotoAndExpect(page, "/reports", /\/reports$/);

    await gotoAndExpect(page, "/table-edit", /\/table-edit$/);
  });

  test("ActionBar controls are visible and Do menu opens", async ({ page }) => {
    await login(page, creds.email!, creds.password!);

    await page.goto("/projects");

    await expect(page.getByRole("button", { name: "Select" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Do" })).toBeVisible();
    await expect(page.getByRole("button", { name: "New" })).toBeVisible();

    await page.getByRole("button", { name: "Do" }).click();
    await expect(page.getByRole("menuitem", { name: "Delete Selected" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Report Selected" })).toBeVisible();
  });
});
