import { test, expect } from "@playwright/test";

test.describe("Admin Login Fix Tests", () => {
  test("should successfully log in with admin credentials", async ({
    page,
  }) => {
    // Navigate to admin login page
    await page.goto("http://localhost:3000/admin/login");

    // Fill in credentials
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("http://localhost:3000/admin/dashboard", {
      timeout: 10000,
    });

    // Verify we're on the dashboard page
    expect(page.url()).toBe("http://localhost:3000/admin/dashboard");

    // Check for dashboard content
    await expect(page.locator("h1, h2")).toContainText([
      "Dashboard",
      "Admin Dashboard",
    ]);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Navigate to admin login page
    await page.goto("http://localhost:3000/admin/login");

    // Fill in invalid credentials
    await page.fill('input[type="email"]', "invalid@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForSelector(
      '[role="alert"], .error-message, .text-red-500',
      { timeout: 5000 }
    );

    // Verify error message is shown
    const errorMessage = await page
      .locator('[role="alert"], .error-message, .text-red-500')
      .textContent();
    expect(errorMessage).toContain("Invalid");
  });

  test("should handle CSRF token correctly when logged in", async ({
    page,
  }) => {
    // First log in
    await page.goto("http://localhost:3000/admin/login");
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL("http://localhost:3000/admin/dashboard", {
      timeout: 10000,
    });

    // Check that CSRF token cookie is set
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find((cookie) => cookie.name === "XSRF-TOKEN");
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie?.value).toBeTruthy();

    // Check that admin token cookie is set
    const adminCookie = cookies.find((cookie) => cookie.name === "admin_token");
    expect(adminCookie).toBeDefined();
    expect(adminCookie?.value).toBeTruthy();
  });

  test("should handle API requests with CSRF token", async ({
    page,
    request,
  }) => {
    // First log in through the UI to get cookies
    await page.goto("http://localhost:3000/admin/login");
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL("http://localhost:3000/admin/dashboard", {
      timeout: 10000,
    });

    // Get cookies from the browser context
    const cookies = await page.context().cookies();
    const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    // Test dashboard stats API with proper cookies
    const response = await request.get(
      "http://localhost:3000/api/admin/dashboard/stats",
      {
        headers: {
          Cookie: cookieString,
        },
      }
    );

    console.log("Dashboard API response:", {
      status: response.status(),
      ok: response.ok(),
    });

    // The response should not be a CSRF error (403)
    expect(response.status()).not.toBe(403);
  });
});
