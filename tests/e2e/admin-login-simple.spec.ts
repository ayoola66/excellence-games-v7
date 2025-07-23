import { test, expect } from "@playwright/test";

test.describe("Admin Login Simple Test", () => {
  test("should log in and check what appears on dashboard", async ({
    page,
  }) => {
    // Enable console logging
    page.on("console", (msg) => console.log("Browser console:", msg.text()));

    // Navigate to admin login page
    await page.goto("http://localhost:3000/admin/login");

    // Take a screenshot of login page
    await page.screenshot({ path: "login-page.png" });

    // Fill in credentials
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");

    // Click login button
    await page.click('button[type="submit"]');

    // Wait a bit and see what happens
    await page.waitForTimeout(3000);

    // Take a screenshot of what we see
    await page.screenshot({ path: "after-login.png" });

    // Log the current URL
    console.log("Current URL:", page.url());

    // Log the page content
    const pageContent = await page.textContent("body");
    console.log("Page content:", pageContent?.substring(0, 500));

    // Check if we're on dashboard or still on login
    if (page.url().includes("/dashboard")) {
      console.log("Successfully redirected to dashboard");

      // Get all headings
      const headings = await page.$$eval("h1, h2, h3", (els) =>
        els.map((el) => ({ tag: el.tagName, text: el.textContent }))
      );
      console.log("Headings found:", headings);
    } else {
      console.log("Still on login page or other page");

      // Check for error messages
      const errors = await page.$$eval(
        '[role="alert"], .error, .text-red-500',
        (els) => els.map((el) => el.textContent)
      );
      console.log("Error messages:", errors);
    }
  });
});
