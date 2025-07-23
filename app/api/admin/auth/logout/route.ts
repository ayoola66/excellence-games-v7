import { NextRequest, NextResponse } from "next/server";
import { enhancedAuth } from "@/lib/enhanced-auth";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("admin_session_id")?.value;
    const token = request.cookies.get("admin_token")?.value;

    if (sessionId && token) {
      // Enhanced logout with session cleanup
      await enhancedAuth.enhancedLogout(sessionId, token);
    }

    // Create response
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 },
    );

    // Clear all auth cookies
    const cookieOptions = {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    response.cookies.set("admin_token", "", cookieOptions);
    response.cookies.set("admin_refresh_token", "", cookieOptions);
    response.cookies.set("admin_session_id", "", cookieOptions);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}

// Also support GET for logout links
export async function GET(request: NextRequest) {
  return POST(request);
}
