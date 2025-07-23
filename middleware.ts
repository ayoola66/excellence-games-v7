import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { enhancedAuth } from "./lib/enhanced-auth";

// Paths that require admin authentication
const ADMIN_PATHS = ["/admin"];
// Paths that are public (no auth required)
const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow public admin paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get tokens and session info
  const adminToken = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("admin_refresh_token")?.value;
  const sessionId = request.cookies.get("admin_session_id")?.value;

  // Enhanced session validation (optional)
  if (sessionId) {
    try {
      const sessionValidation = enhancedAuth.validateSession(
        sessionId,
        request,
      );
      if (!sessionValidation.valid) {
        console.log(`Session validation failed: ${sessionValidation.reason}`);
        // Don't fail here, just log for monitoring
      }
    } catch (error) {
      console.error("Session validation error:", error);
      // Continue with token validation
    }
  }

  if (!adminToken) {
    if (!refreshToken) {
      // No tokens available, redirect to login
      return redirectToLogin(request);
    }

    try {
      // Try to refresh the token using original Strapi endpoint
      const STRAPI_URL =
        process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
      const response = await fetch(
        `${STRAPI_URL}/api/admin/auth/regenerate-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      if (!response.ok) {
        // Token refresh failed
        return redirectToLogin(request);
      }

      const data = await response.json();

      // Create response with new tokens
      const nextResponse = NextResponse.next();

      // Set new tokens in cookies
      nextResponse.cookies.set("admin_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      nextResponse.cookies.set("admin_refresh_token", data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: "/",
      });

      return nextResponse;
    } catch (error) {
      console.error("Token refresh error:", error);
      return redirectToLogin(request);
    }
  }

  try {
    // Verify the token with Strapi
    const STRAPI_URL =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
    const response = await fetch(`${STRAPI_URL}/api/admin/auth/verify`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, try refresh flow
      if (!refreshToken) {
        return redirectToLogin(request);
      }

      const refreshResponse = await fetch(
        `${STRAPI_URL}/api/admin/auth/regenerate-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      );

      if (!refreshResponse.ok) {
        return redirectToLogin(request);
      }

      const refreshData = await refreshResponse.json();

      // Create response with new tokens
      const nextResponse = NextResponse.next();

      nextResponse.cookies.set("admin_token", refreshData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      nextResponse.cookies.set(
        "admin_refresh_token",
        refreshData.refreshToken,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        },
      );

      return nextResponse;
    }

    // Token is valid, continue with request
    return NextResponse.next();
  } catch (error) {
    console.error("Token verification error:", error);
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?from=${encodeURIComponent(request.nextUrl.pathname)}`;

  // Clear invalid cookies
  const response = NextResponse.redirect(url);
  response.cookies.delete("admin_token");
  response.cookies.delete("admin_refresh_token");
  response.cookies.delete("admin_session_id");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
