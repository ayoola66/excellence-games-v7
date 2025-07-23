import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    console.log("Testing database connections...");
    console.log("STRAPI_URL:", STRAPI_URL);
    console.log("Token:", token ? "Present" : "Missing");

    const results: any = {};

    // Test different endpoints to see what works
    const endpoints = [
      "/api/users",
      "/api/users-permissions/users",
      "/api/platform-admins",
      "/api/games",
      "/api/categories",
      "/api/questions",
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${STRAPI_URL}${endpoint}`);

        const response = await fetch(
          `${STRAPI_URL}${endpoint}?pagination[limit]=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 5000,
          },
        );

        console.log(`${endpoint} - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          results[endpoint] = {
            status: response.status,
            count: data.meta?.pagination?.total || data.length || 0,
            sample: data.data ? data.data.slice(0, 2) : data.slice(0, 2),
          };
        } else {
          const errorText = await response.text();
          results[endpoint] = {
            status: response.status,
            error: errorText,
          };
        }
      } catch (error) {
        results[endpoint] = {
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return NextResponse.json({
      strapiUrl: STRAPI_URL,
      hasToken: !!token,
      results,
    });
  } catch (error) {
    console.error("Test DB error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
