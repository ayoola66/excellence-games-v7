import { NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export async function GET() {
  console.log("Testing backend connection...");
  console.log("STRAPI_URL:", STRAPI_URL);
  console.log("STRAPI_ADMIN_TOKEN exists:", !!STRAPI_ADMIN_TOKEN);

  if (!STRAPI_ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "STRAPI_ADMIN_TOKEN is not set" },
      { status: 500 },
    );
  }

  // First test basic connectivity
  try {
    console.log("Testing basic connectivity to:", STRAPI_URL);
    const healthResponse = await fetch(`${STRAPI_URL}/_health`, {
      method: "GET",
    });
    console.log("Health check status:", healthResponse.status);
  } catch (error) {
    console.error("Backend connectivity test failed:", error);
    return NextResponse.json(
      {
        error: "Backend is not accessible",
        details: error.message,
        url: STRAPI_URL,
      },
      { status: 503 },
    );
  }

  try {
    console.log("Testing stats endpoint:", `${STRAPI_URL}/api/admin/stats`);

    // Get a working admin token
    let workingToken = STRAPI_ADMIN_TOKEN;

    if (!workingToken) {
      console.log(
        "No STRAPI_ADMIN_TOKEN, trying to get fresh token via login...",
      );
      try {
        const loginResponse = await fetch(
          `${STRAPI_URL}/api/admin/auth/local`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: "superadmin@elitegames.com",
              password: "Passw0rd",
            }),
          },
        );

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          workingToken = loginData.token;
          console.log("✅ Got fresh admin token for testing");
        } else {
          throw new Error(`Login failed: ${loginResponse.status}`);
        }
      } catch (loginError) {
        console.error("❌ Failed to get admin token:", loginError);
        return NextResponse.json(
          {
            error: "Backend authentication failed",
            details: loginError.message,
          },
          { status: 500 },
        );
      }
    }

    // Test the stats endpoint
    const response = await fetch(`${STRAPI_URL}/api/admin/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${workingToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Stats response status:", response.status);
    console.log(
      "Stats response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      let errorDetails = {};
      try {
        errorDetails = await response.json();
      } catch (e) {
        try {
          errorDetails = { text: await response.text() };
        } catch (e2) {
          errorDetails = { error: "Could not parse error response" };
        }
      }

      return NextResponse.json(
        {
          error: "Stats endpoint failed",
          status: response.status,
          statusText: response.statusText,
          details: errorDetails,
          url: `${STRAPI_URL}/api/admin/stats`,
        },
        { status: 500 },
      );
    }

    const data = await response.json();
    console.log("Stats data received:", data);

    return NextResponse.json({
      success: true,
      message: "Stats endpoint is working",
      data,
      url: `${STRAPI_URL}/api/admin/stats`,
    });
  } catch (error: any) {
    console.error("Stats test error:", error);
    return NextResponse.json(
      {
        error: `Stats test error: ${error.message}`,
        stack: error.stack,
        url: `${STRAPI_URL}/api/admin/stats`,
      },
      { status: 500 },
    );
  }
}
