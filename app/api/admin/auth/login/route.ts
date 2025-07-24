import { NextRequest, NextResponse } from "next/server";
import { loginRateLimiter } from "@/lib/rate-limiter";
import { ErrorMessages } from "@/lib/error-utils";
import { enhancedAuth } from "@/lib/enhanced-auth";

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await loginRateLimiter(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    // Log login attempt with sanitized info
    console.log("Login attempt details:", {
      email: email?.slice(0, 3) + "***@" + email?.split("@")[1],
      userAgent: request.headers.get("user-agent")?.slice(0, 50),
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    if (!email || !password) {
      console.log("Login failed: Missing credentials");
      return NextResponse.json(
        { error: ErrorMessages.BAD_REQUEST },
        { status: 400 },
      );
    }

    // First try the original Strapi authentication
    const STRAPI_URL =
      process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

    const loginResponse = await fetch(`${STRAPI_URL}/api/admin/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log("Login failed:", {
        status: loginResponse.status,
        statusText: loginResponse.statusText,
        error: errorText,
      });

      // Log security event for failed login
      enhancedAuth.logSecurityEvent({
        type: "FAILED_LOGIN",
        ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
        userAgent: request.headers.get("user-agent") || "",
        timestamp: Date.now(),
        details: { email, reason: "Invalid credentials" },
      });

      return NextResponse.json(
        { error: ErrorMessages.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const { token, refreshToken, user } = await loginResponse.json();

    // Create enhanced session tracking
    const deviceFingerprint = enhancedAuth.generateDeviceFingerprint(request);
    const session = enhancedAuth.createSession(
      user.id.toString(),
      deviceFingerprint,
    );

    // Log successful login
    enhancedAuth.logSecurityEvent({
      type: "LOGIN",
      userId: user.id.toString(),
      ipAddress: deviceFingerprint.ipAddress,
      userAgent: deviceFingerprint.userAgent,
      timestamp: Date.now(),
      details: { sessionId: session.id },
    });

    // Create response with user data
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          adminId: user.adminId,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          accessLevel: user.accessLevel,
          permissions: user.permissions,
        },
        sessionInfo: {
          sessionId: session.id,
          expiresAt: session.expiresAt,
        },
      },
      { status: 200 },
    );

    // Set cookies with session tracking
    console.log("Setting admin cookies:", {
      hasToken: !!token,
      tokenLength: token?.length,
      environment: process.env.NODE_ENV,
      sessionId: session.id,
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    response.cookies.set("admin_session_id", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    // Log security event for failed login
    enhancedAuth.logSecurityEvent({
      type: "FAILED_LOGIN",
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: request.headers.get("user-agent") || "",
      timestamp: Date.now(),
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      { error: ErrorMessages.INTERNAL_ERROR },
      { status: 500 },
    );
  }
}
