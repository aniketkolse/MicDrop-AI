import { test, expect } from "@playwright/test";

test.describe("MicDrop AI E2E", () => {
  test("homepage loads and shows studio", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MicDrop AI/);
    await expect(page.getByText("Turn a thought into")).toBeVisible();
  });

  test("auth page shows login form", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.getByPlaceholder(/you@example.com/)).toBeVisible();
    await expect(page.getByPlaceholder(/••••••••/)).toBeVisible();
  });

  test("voices page shows voice catalogue", async ({ page }) => {
    await page.goto("/voices");
    await expect(page.getByText(/Voice studio/)).toBeVisible();
  });

  test("settings page shows configuration", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("h1")).toContainText(/Settings/);
  });

  test("create page shows form", async ({ page }) => {
    await page.goto("/dashboard/create");
    await expect(page.getByPlaceholder(/Enter your podcast topic/)).toBeVisible();
  });
});
