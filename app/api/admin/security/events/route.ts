import { NextRequest, NextResponse } from "next/server";
import { enhancedAuth } from "@/lib/enhanced-auth";
import {
  errorTracker,
  ErrorCodes,
  ErrorMessages,
  createAuthError,
} from "@/lib/error-utils";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Validate user and check permissions
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Check if user has permission to view security events
    if (
      user.accessLevel !== "full" &&
      !user.permissions.includes("security.view")
    ) {
      throw createAuthError(ErrorCodes.INSUFFICIENT_PERMISSIONS);
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type");

    // Get security events
    let securityEvents = enhancedAuth.getSecurityEvents(
      userId || undefined,
      limit,
    );

    // Filter by type if specified
    if (type) {
      securityEvents = securityEvents.filter((event) => event.type === type);
    }

    // Get error statistics
    const errorStats = errorTracker.getErrorStats();

    // Get session statistics
    const sessionStats = enhancedAuth.getSessionStats();

    return NextResponse.json({
      securityEvents,
      errorStats,
      sessionStats,
      summary: {
        totalEvents: securityEvents.length,
        recentLogins: securityEvents.filter((e) => e.type === "LOGIN").length,
        failedLogins: securityEvents.filter((e) => e.type === "FAILED_LOGIN")
          .length,
        suspiciousActivity: securityEvents.filter(
          (e) => e.type === "SUSPICIOUS_ACTIVITY",
        ).length,
      },
    });
  } catch (error) {
    console.error("Security events error:", error);

    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).statusCode },
      );
    }

    return NextResponse.json(
      { error: ErrorMessages.INTERNAL_ERROR },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Validate user and check permissions
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Check if user has permission to create security events
    if (
      user.accessLevel !== "full" &&
      !user.permissions.includes("security.manage")
    ) {
      throw createAuthError(ErrorCodes.INSUFFICIENT_PERMISSIONS);
    }

    const body = await request.json();
    const { type, details } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Event type is required" },
        { status: 400 },
      );
    }

    // Log custom security event
    enhancedAuth.logSecurityEvent({
      type,
      userId: user.id,
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: request.headers.get("user-agent") || "",
      timestamp: Date.now(),
      details: { ...details, createdBy: user.id },
    });

    return NextResponse.json({
      message: "Security event logged successfully",
      type,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Security event creation error:", error);

    if (error instanceof Error && "statusCode" in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as any).statusCode },
      );
    }

    return NextResponse.json(
      { error: ErrorMessages.INTERNAL_ERROR },
      { status: 500 },
    );
  }
}
