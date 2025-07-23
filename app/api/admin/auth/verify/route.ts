import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "No token found", requiresAuth: true },
        { status: 401 },
      );
    }

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Verification timeout")), 5000),
    );

    // Verify token with Strapi
    const verifyPromise = fetch(`${STRAPI_URL}/api/admin/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await Promise.race([verifyPromise, timeoutPromise]);

    if (!response.ok) {
      // Try to refresh token
      const refreshToken = cookieStore.get("admin_refresh_token")?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { error: "No refresh token found", requiresAuth: true },
          { status: 401 },
        );
      }

      try {
        const refreshPromise = fetch(
          `${STRAPI_URL}/api/admin/auth/regenerate-token`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        const refreshResponse = await Promise.race([
          refreshPromise,
          timeoutPromise,
        ]);

        if (!refreshResponse.ok) {
          return NextResponse.json(
            {
              error: "Failed to refresh token",
              requiresAuth: true,
            },
            { status: 401 },
          );
        }

        const { token: newToken, refreshToken: newRefreshToken } =
          await refreshResponse.json();

        // Create response with new tokens
        const nextResponse = NextResponse.json({ valid: true });

        // Set new tokens in cookies
        nextResponse.cookies.set("admin_token", newToken, {
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
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
        return NextResponse.json(
          {
            error: "Token refresh failed",
            requiresAuth: true,
          },
          { status: 401 },
        );
      }
    }

    const data = await response.json();
    return NextResponse.json({ valid: true, admin: data.admin });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      {
        error: "Failed to verify token",
        requiresAuth: true,
      },
      { status: 401 },
    );
  }
}
