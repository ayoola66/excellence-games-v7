import { test, expect } from "@playwright/test";

test.describe("Admin Nested Game Creation Test", () => {
  test("should successfully create a nested game", async ({ page }) => {
    // Enable detailed logging
    page.on("console", (msg) => console.log("Browser console:", msg.text()));
    page.on("request", (req) => {
      if (req.method() === "POST") {
        console.log(`Request ${req.method()} ${req.url()}:`, {
          headers: req.headers(),
          data: req.postData(),
        });
      }
    });
    page.on("response", (res) => {
      if (res.status() >= 400) {
        console.log(`Response Error ${res.status()} ${res.url()}`);
        res.text().then((text) => console.log("Response body:", text));
      }
    });

    // First log in
    await page.goto("http://localhost:3000/admin/login");
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");
    await page.click('button[type="submit"]');

    // Wait for dashboard and verify login
    await page.waitForURL("http://localhost:3000/admin/dashboard", {
      timeout: 10000,
    });
    console.log("Successfully logged in");

    // Navigate to games page
    await page.goto("http://localhost:3000/admin/games/new");
    await page.waitForTimeout(2000);

    // Take screenshot of the form
    await page.screenshot({ path: "game-form.png" });

    // Get all form fields and their values
    const formFields = await page.$$eval(
      "input, select, textarea",
      (fields: HTMLElement[]) =>
        fields.map((f) => {
          const input = f as
            | HTMLInputElement
            | HTMLSelectElement
            | HTMLTextAreaElement;
          return {
            type: input.tagName.toLowerCase(),
            name: input.name || "",
            id: input.id || "",
            value: input.value || "",
            placeholder: "placeholder" in input ? input.placeholder : "",
          };
        })
    );
    console.log("Available form fields:", formFields);

    // Fill out the game form
    await page.fill(
      'input[name="name"], input[name="title"]',
      "Test Nested Game"
    );
    await page.fill(
      'textarea[name="description"]',
      "This is a test nested game"
    );

    // Look for game type selection
    const typeSelect = page.locator(
      'select[name="type"], select[name="gameType"]'
    );
    if ((await typeSelect.count()) > 0) {
      await typeSelect.selectOption("NESTED");
      console.log("Selected NESTED game type");
    }

    // Look for and fill any nested game specific fields
    const nestedFields = await page.$$(
      '[data-nested="true"], [id*="nested"], [name*="nested"]'
    );
    if (nestedFields.length > 0) {
      console.log("Found nested game specific fields:", nestedFields.length);
    }

    // Take screenshot before submission
    await page.screenshot({ path: "before-submit.png" });

    // Get all cookies before submission
    const cookies = await page.context().cookies();
    console.log(
      "Cookies before submission:",
      cookies.map((c) => c.name)
    );

    // Submit the form
    const submitButton = page.locator('button[type="submit"]');
    if ((await submitButton.count()) > 0) {
      console.log("Found submit button, clicking...");
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(3000);

      // Take screenshot after submission
      await page.screenshot({ path: "after-submit.png" });

      // Check for error messages
      const errors = await page.$$eval(
        '[role="alert"], .error, .text-red-500',
        (els) => els.map((el) => el.textContent || "")
      );
      if (errors.length > 0) {
        console.log("Error messages found:", errors);
      }

      // Check response status
      const currentUrl = page.url();
      console.log("Current URL after submission:", currentUrl);

      // If we're still on the form, something went wrong
      if (currentUrl.includes("/new")) {
        const pageContent = (await page.textContent("body")) || "";
        console.log("Page content after error:", pageContent.substring(0, 500));
      }
    } else {
      console.log("Submit button not found");
    }
  });
});
