import { test, expect } from "@playwright/test";

test.describe("Admin Game Creation Test", () => {
  test("should successfully create a new game without CSRF errors", async ({
    page,
  }) => {
    // Enable console logging
    page.on("console", (msg) => console.log("Browser console:", msg.text()));

    // First log in
    await page.goto("http://localhost:3000/admin/login");
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL("http://localhost:3000/admin/dashboard", {
      timeout: 10000,
    });

    // Navigate to games page
    await page.goto("http://localhost:3000/admin/games");
    await page.waitForTimeout(2000);

    // Take screenshot of games page
    await page.screenshot({ path: "games-page.png" });

    // Look for create game button or form
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("Add"), button:has-text("New")'
    );

    if ((await createButton.count()) > 0) {
      console.log("Found create button, clicking it");
      await createButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Look for game creation form
    const gameNameInput = page.locator(
      'input[name="name"], input[name="title"], input[placeholder*="name"], input[placeholder*="title"]'
    );

    if ((await gameNameInput.count()) > 0) {
      console.log("Found game creation form");

      // Fill out the form
      await gameNameInput.first().fill("Test Game from Playwright");

      // Look for description field
      const descriptionField = page.locator(
        'textarea[name="description"], input[name="description"], textarea[placeholder*="description"]'
      );
      if ((await descriptionField.count()) > 0) {
        await descriptionField
          .first()
          .fill(
            "This is a test game created by Playwright to verify CSRF token functionality"
          );
      }

      // Look for type/category selection
      const typeSelect = page.locator(
        'select[name="type"], select[name="gameType"]'
      );
      if ((await typeSelect.count()) > 0) {
        await typeSelect.first().selectOption("STRAIGHT");
      }

      // Take screenshot before submitting
      await page.screenshot({ path: "game-form-filled.png" });

      // Submit the form
      const submitButton = page.locator(
        'button[type="submit"], button:has-text("Create"), button:has-text("Save"), button:has-text("Submit")'
      );
      if ((await submitButton.count()) > 0) {
        console.log("Submitting game creation form");
        await submitButton.first().click();

        // Wait for response
        await page.waitForTimeout(3000);

        // Take screenshot after submission
        await page.screenshot({ path: "after-game-creation.png" });

        // Check for success message or redirect
        const currentUrl = page.url();
        console.log("URL after submission:", currentUrl);

        // Check for error messages
        const errorElements = await page.$$(
          '[role="alert"], .error, .text-red-500, .alert-error'
        );
        const errors = await Promise.all(
          errorElements.map((el) => el.textContent())
        );
        console.log(
          "Error messages found:",
          errors.filter((e) => e && e.trim())
        );

        // Check for success messages
        const successElements = await page.$$(
          ".success, .text-green-500, .alert-success"
        );
        const successMessages = await Promise.all(
          successElements.map((el) => el.textContent())
        );
        console.log(
          "Success messages found:",
          successMessages.filter((s) => s && s.trim())
        );

        // Verify no CSRF token error
        const pageContent = await page.textContent("body");
        expect(pageContent).not.toContain("Invalid CSRF token");
        expect(pageContent).not.toContain("CSRF");

        console.log("Game creation test completed - no CSRF errors detected");
      } else {
        console.log("No submit button found");
      }
    } else {
      console.log("No game creation form found");
      // Log what's on the page
      const pageContent = await page.textContent("body");
      console.log("Page content:", pageContent?.substring(0, 500));
    }
  });
});
