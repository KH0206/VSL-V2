import { expect, test } from "@playwright/test";
import { getE2ECredentials, login } from "./helpers/auth";

const creds = getE2ECredentials();

test.describe("Dashboard Overview", () => {
  test.skip(!creds.isConfigured, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated E2E tests.");

  test("renders gantt-style allocation view and captures design screenshot", async ({ page }) => {
    await login(page, creds.email!, creds.password!);

    await page.goto("/dashboard-overview");
    await expect(page.getByText("Project Allocation Timeline")).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Select" })).toBeVisible();

    await page.setViewportSize({ width: 1440, height: 900 });
    const timeline = page.locator(".dashboard-timeline");
    await expect(timeline).toBeVisible();
    await expect(timeline).toHaveScreenshot("dashboard-overview.png", { maxDiffPixelRatio: 0.04 });
  });
});
