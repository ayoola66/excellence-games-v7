import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Create Science Nested Game", () => {
  test("should create a nested Science game with categories", async ({
    page,
  }) => {
    // Enable request/response logging
    page.on("request", (request) => {
      if (request.method() === "POST") {
        console.log("Request:", {
          url: request.url(),
          headers: request.headers(),
          postData: request.postData(),
        });
      }
    });
    page.on("response", async (response) => {
      if (response.status() >= 400) {
        console.log("Response error:", {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          body: await response
            .text()
            .catch(() => "Failed to get response text"),
        });
      }
    });

    // Log in first
    await page.goto("http://localhost:3000/admin/login");
    await page.fill('input[type="email"]', "superadmin@elitegames.com");
    await page.fill('input[type="password"]', "Passw0rd");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://localhost:3000/admin/dashboard");

    // Navigate to game creation page
    await page.goto("http://localhost:3000/admin/games/new");
    await page.waitForLoadState("networkidle");

    // Fill in the game details
    await page.fill('input[name="name"]', "Science - Full");
    await page.fill(
      'textarea[name="description"]',
      "Science Trivia questions consists of Biology, Fun Science, Human Body, Chemistry and Astronomy questions"
    );

    // Select NESTED game type - using the radio group
    await page.click('div[role="radiogroup"] >> text=Nested Game');

    // Fill in categories
    const categories = [
      "Biology",
      "Fun Science",
      "Human Body",
      "Chemistry",
      "Astronomy",
    ];
    for (let i = 0; i < categories.length; i++) {
      await page.fill(`input[name="categories[${i}]"]`, categories[i]);
    }

    // Upload thumbnail
    const thumbnailPath = path.join(
      process.cwd(),
      "docs/data-files/general-trivia-image-test-1.png"
    );
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(thumbnailPath);

    // Get CSRF token before submission
    const cookies = await page.context().cookies();
    const csrfCookie = cookies.find((c) => c.name === "XSRF-TOKEN");
    console.log("CSRF token:", csrfCookie?.value);

    // Submit the form and wait for response
    const submitPromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin/games") &&
        response.request().method() === "POST"
    );
    await page.click('button[type="submit"]');
    const response = await submitPromise;

    // Log response details
    const responseBody = await response
      .text()
      .catch(() => "Failed to get response text");
    console.log("Form submission response:", {
      status: response.status(),
      statusText: response.statusText(),
      body: responseBody,
    });

    // Wait for navigation after successful submission
    await page.waitForURL("http://localhost:3000/admin/games", {
      timeout: 60000,
    });

    // Verify the game was created
    const gameTitle = page.locator("text=Science - Full");
    await expect(gameTitle).toBeVisible();
  });
});
