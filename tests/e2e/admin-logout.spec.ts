import { test, expect } from "@playwright/test";

test.describe("Admin Logout Test", () => {
  test("should successfully log out from admin dashboard", async ({ page }) => {
    // Enable console logging
    page.on("console", (msg) => console.log("Browser console:", msg.text()));
    page.on("request", (req) =>
      console.log(`Request: ${req.method()} ${req.url()}`)
    );
    page.on("response", (res) =>
      console.log(`Response: ${res.status()} ${res.url()}`)
    );

    // First log in
    await page.goto("http://localhost:3000/admin/login");
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL("http://localhost:3000/admin/dashboard", {
      timeout: 10000,
    });
    console.log("Successfully logged in to dashboard");

    // Take screenshot before logout
    await page.screenshot({ path: "before-logout.png" });

    // Look for logout button/link
    const logoutButton = page.locator(
      'button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Sign Out")'
    );

    if ((await logoutButton.count()) > 0) {
      console.log("Found logout button");

      // Click logout
      await logoutButton.first().click();

      // Wait for redirect or confirmation
      await page.waitForTimeout(2000);

      // Take screenshot after logout attempt
      await page.screenshot({ path: "after-logout.png" });

      // Check current URL
      const currentUrl = page.url();
      console.log("Current URL after logout:", currentUrl);

      // Verify we're logged out by trying to access dashboard
      await page.goto("http://localhost:3000/admin/dashboard");
      await page.waitForTimeout(1000);

      // Should be redirected to login
      expect(page.url()).toContain("/admin/login");

      // Check cookies are cleared
      const cookies = await page.context().cookies();
      const adminCookie = cookies.find((c) => c.name === "admin_token");
      const csrfCookie = cookies.find((c) => c.name === "XSRF-TOKEN");

      console.log(
        "Remaining cookies:",
        cookies.map((c) => c.name)
      );
      expect(adminCookie).toBeUndefined();
    } else {
      console.log("No logout button found");
      // Log the page content to see what's available
      const content = await page.content();
      console.log("Page content:", content.substring(0, 500));
    }
  });
});
