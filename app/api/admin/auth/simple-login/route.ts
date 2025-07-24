import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Simple Strapi authentication
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
      console.log("Simple login failed:", errorText);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const { token, refreshToken, user } = await loginResponse.json();

    console.log("Simple login success:", {
      hasToken: !!token,
      tokenLength: token?.length,
      userId: user?.id,
    });

    // Create simple response with cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });

    // Set simple cookies
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: false, // Allow HTTP in development
      sameSite: "lax", // More permissive
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    response.cookies.set("admin_refresh_token", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Simple login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
