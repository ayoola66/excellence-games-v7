import { test, expect } from "@playwright/test";

test.describe("Admin API CSRF Test", () => {
  test("should handle API requests without CSRF errors after login", async ({
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

    console.log(
      "Cookies found:",
      cookies.map((c) => c.name)
    );

    // Find CSRF token
    const csrfCookie = cookies.find((c) => c.name === "XSRF-TOKEN");
    console.log("CSRF token found:", !!csrfCookie);

    // Test dashboard stats API (GET request - should work without CSRF)
    const statsResponse = await request.get(
      "http://localhost:3000/api/admin/dashboard/stats",
      {
        headers: {
          Cookie: cookieString,
        },
      }
    );

    console.log("Dashboard stats API response:", {
      status: statsResponse.status(),
      ok: statsResponse.ok(),
    });

    // Should not be a CSRF error
    expect(statsResponse.status()).not.toBe(403);

    // Test games API (GET request)
    const gamesResponse = await request.get(
      "http://localhost:3000/api/admin/games",
      {
        headers: {
          Cookie: cookieString,
        },
      }
    );

    console.log("Games API response:", {
      status: gamesResponse.status(),
      ok: gamesResponse.ok(),
    });

    expect(gamesResponse.status()).not.toBe(403);

    // Test POST request with CSRF token
    if (csrfCookie) {
      const postResponse = await request.post(
        "http://localhost:3000/api/admin/games",
        {
          headers: {
            Cookie: cookieString,
            "X-XSRF-TOKEN": csrfCookie.value,
            "Content-Type": "application/json",
          },
          data: {
            name: "Test Game from API",
            description: "Test game for CSRF validation",
            type: "STRAIGHT",
            status: "DRAFT",
          },
        }
      );

      console.log("POST request response:", {
        status: postResponse.status(),
        ok: postResponse.ok(),
      });

      // Should not be a CSRF error (403)
      expect(postResponse.status()).not.toBe(403);

      if (!postResponse.ok()) {
        const responseText = await postResponse.text();
        console.log("POST response body:", responseText);

        // Specifically check it's not a CSRF error
        expect(responseText).not.toContain("Invalid CSRF token");
        expect(responseText).not.toContain("Missing CSRF token");
      }
    }

    console.log(
      "All API tests completed successfully - no CSRF errors detected"
    );
  });
});
