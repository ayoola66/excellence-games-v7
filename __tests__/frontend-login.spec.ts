import { test, expect } from "@playwright/test";

test.describe("Frontend User Login", () => {
  test("should successfully login with premium user credentials", async ({
    page,
  }) => {
    // Enable console logging for debugging
    page.on("console", (msg) => console.log("BROWSER:", msg.text()));
    page.on("pageerror", (err) => console.error("BROWSER ERROR:", err));

    // Navigate to the frontend login page
    await page.goto("/login");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Take a screenshot before login
    await page.screenshot({ path: "test-results/before-login.png" });

    // Fill in the premium user credentials
    await page.fill('input[name="email"]', "premium@elitegames.com");
    await page.fill('input[name="password"]', "Passw0rd");

    // Take a screenshot with filled credentials
    await page.screenshot({ path: "test-results/credentials-filled.png" });

    // Submit the login form
    await page.click('button[type="submit"]');

    // Wait for navigation or response
    await page.waitForLoadState("networkidle");

    // Check if login was successful by looking for expected elements
    // This could be a dashboard, profile page, or redirect to games
    const currentUrl = page.url();
    console.log("Current URL after login:", currentUrl);

    // Take a screenshot after login attempt
    await page.screenshot({ path: "test-results/after-login.png" });

    // Check for success indicators (adjust based on your app's behavior)
    // Option 1: Check if redirected to a protected page
    const isLoggedIn = !currentUrl.includes("/login");

    // Option 2: Check for user-specific elements
    const userElement = await page
      .locator('[data-testid="user-menu"], .user-profile, .logout-button')
      .first();
    const hasUserElement = await userElement.isVisible().catch(() => false);

    // Option 3: Check for absence of login form
    const loginForm = await page.locator("form").first();
    const hasLoginForm = await loginForm.isVisible().catch(() => false);

    console.log("Login status checks:", {
      isLoggedIn,
      hasUserElement,
      hasLoginForm: !hasLoginForm,
    });

    // Assert successful login
    expect(isLoggedIn || hasUserElement || !hasLoginForm).toBeTruthy();
  });

  test("should handle invalid credentials gracefully", async ({ page }) => {
    // Navigate to login page
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Try with invalid credentials
    await page.fill('input[name="email"]', "premium@elitegames.com");
    await page.fill('input[name="password"]', "WrongPassword");
    await page.click('button[type="submit"]');

    await page.waitForLoadState("networkidle");

    // Should still be on login page or show error
    const currentUrl = page.url();
    const hasError = await page
      .locator('.error, [role="alert"], .text-red')
      .first()
      .isVisible()
      .catch(() => false);

    expect(currentUrl.includes("/login") || hasError).toBeTruthy();
  });

  test("should validate required fields", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    // Try to submit without filling fields
    await page.click('button[type="submit"]');

    // Check for validation messages
    const emailValidation = await page
      .locator('input[name="email"]:invalid')
      .isVisible()
      .catch(() => false);
    const passwordValidation = await page
      .locator('input[name="password"]:invalid')
      .isVisible()
      .catch(() => false);

    expect(emailValidation || passwordValidation).toBeTruthy();
  });
});
