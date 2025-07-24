import { NextRequest, NextResponse } from "next/server";
import { getAdminToken } from "../utils/auth";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const allCookies = Array.from(cookieStore.getAll());
    const adminToken = getAdminToken();

    return NextResponse.json({
      success: true,
      debug: {
        hasAdminToken: !!adminToken,
        tokenPreview: adminToken ? `${adminToken.substring(0, 20)}...` : null,
        allCookieNames: allCookies.map((c) => c.name),
        cookieCount: allCookies.length,
        adminTokenCookie: cookieStore.get("admin_token")?.value
          ? "present"
          : "missing",
        userAgent: request.headers.get("user-agent")?.substring(0, 50),
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: {
        errorType: error.constructor.name,
      },
    });
  }
}
