import { expect, type Page } from "@playwright/test";

export function getE2ECredentials() {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  return { email, password, isConfigured: Boolean(email && password) };
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();

  const destination = await Promise.race([
    page.waitForURL("**/dashboard", { timeout: 10000 }).then(() => "dashboard" as const),
    page
      .waitForURL("**/login?error=*", { timeout: 10000 })
      .then(() => "login-error" as const),
  ]);

  if (destination === "login-error") {
    const url = new URL(page.url());
    const message = url.searchParams.get("error") ?? "Invalid login credentials";
    throw new Error(
      `E2E login failed for E2E_EMAIL. Supabase returned: ${message}. Update E2E_EMAIL/E2E_PASSWORD in run/run-e2e.cmd.`,
    );
  }

  await expect(page.getByText("Signed in as")).toBeVisible();
}
