import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
const STRAPI_ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN;

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if token is set
  if (!STRAPI_ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "STRAPI_ADMIN_TOKEN is not set" },
      { status: 500 }
    );
  }

  try {
    // Test the token with a simple request
    const response = await fetch(`${STRAPI_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRAPI_ADMIN_TOKEN}`,
      },
    });

    if (!response.ok) {
      // Try to get more detailed error information
      let errorDetails = {};
      try {
        errorDetails = await response.json();
      } catch (e) {
        // If we can't parse JSON, just use the text
        try {
          errorDetails = { text: await response.text() };
        } catch (e2) {
          errorDetails = { error: "Could not parse error response" };
        }
      }

      return NextResponse.json(
        {
          error: "Token validation failed",
          status: response.status,
          statusText: response.statusText,
          details: errorDetails,
          tokenLength: STRAPI_ADMIN_TOKEN.length,
          tokenPrefix: STRAPI_ADMIN_TOKEN.substring(0, 5) + "...",
          tokenSuffix:
            "..." + STRAPI_ADMIN_TOKEN.substring(STRAPI_ADMIN_TOKEN.length - 5),
          apiUrl: STRAPI_URL,
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: "Token is valid",
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
      },
      tokenLength: STRAPI_ADMIN_TOKEN.length,
      tokenPrefix: STRAPI_ADMIN_TOKEN.substring(0, 5) + "...",
      tokenSuffix:
        "..." + STRAPI_ADMIN_TOKEN.substring(STRAPI_ADMIN_TOKEN.length - 5),
      apiUrl: STRAPI_URL,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: `Token validation error: ${error.message}`,
        stack: error.stack,
        apiUrl: STRAPI_URL,
        tokenLength: STRAPI_ADMIN_TOKEN.length,
        tokenPrefix: STRAPI_ADMIN_TOKEN.substring(0, 5) + "...",
        tokenSuffix:
          "..." + STRAPI_ADMIN_TOKEN.substring(STRAPI_ADMIN_TOKEN.length - 5),
      },
      { status: 500 }
    );
  }
}
