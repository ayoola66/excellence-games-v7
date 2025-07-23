import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/admin-auth";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = adminAuth.getRefreshToken(request);

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token available" },
        { status: 401 }
      );
    }

    // Refresh token with Strapi
    const response = await fetch(`${STRAPI_URL}/api/admin/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Token refresh failed" },
        { status: 401 }
      );
    }

    const { token, refreshToken: newRefreshToken } = await response.json();

    // Create response with new tokens in cookies
    const nextResponse = NextResponse.json(
      { message: "Token refreshed successfully" },
      { status: 200 }
    );

    // Set new cookies
    nextResponse.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    nextResponse.cookies.set("admin_refresh_token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
