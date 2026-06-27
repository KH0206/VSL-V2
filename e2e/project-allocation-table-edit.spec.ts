import { expect, test } from "@playwright/test";
import { getE2ECredentials, login } from "./helpers/auth";

const creds = getE2ECredentials();

test.describe("Project Allocation Table Edit", () => {
  test.skip(!creds.isConfigured, "Set E2E_EMAIL and E2E_PASSWORD to run authenticated E2E tests.");

  test("table-edit project_allocation page renders CRUD controls", async ({ page }) => {
    await login(page, creds.email!, creds.password!);

    await page.goto("/table-edit/project_allocation");

    await expect(page.getByRole("button", { name: "Select" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Do" })).toBeVisible();

    const newButton = page.getByRole("button", { name: "New" });
    await expect(newButton).toBeVisible();

    const emptyState = page.getByText("No rows yet");
    if (await emptyState.count()) {
      await expect(emptyState).toBeVisible();
      await expect(newButton).toBeDisabled();
      return;
    }

    // Non-destructive smoke: verify row-level action icons exist when data exists.
    await expect(page.getByRole("button", { name: "Edit row" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete row" }).first()).toBeVisible();
  });
});
