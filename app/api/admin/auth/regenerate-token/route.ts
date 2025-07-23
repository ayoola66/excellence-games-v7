import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("admin_refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token found" },
        { status: 401 }
      );
    }

    // Call Strapi's token refresh endpoint
    const response = await fetch(
      `${STRAPI_URL}/api/admin/auth/regenerate-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    if (!response.ok) {
      // If refresh token is invalid, clear cookies
      const cookieOptions = {
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
      };

      cookieStore.set("admin_token", "", cookieOptions);
      cookieStore.set("admin_refresh_token", "", cookieOptions);

      return NextResponse.json(
        { error: "Failed to refresh token" },
        { status: response.status }
      );
    }

    const { token, refreshToken: newRefreshToken } = await response.json();

    // Create response
    const nextResponse = NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
    });

    // Set new tokens in cookies
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
      { error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
