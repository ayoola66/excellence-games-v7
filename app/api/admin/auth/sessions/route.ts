import { NextRequest, NextResponse } from "next/server";
import { enhancedAuth } from "@/lib/enhanced-auth";
import { ErrorCodes, ErrorMessages, createAuthError } from "@/lib/error-utils";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("admin_session_id")?.value;
    const token = request.cookies.get("admin_token")?.value;

    if (!sessionId || !token) {
      throw createAuthError(ErrorCodes.SESSION_EXPIRED);
    }

    // Validate current session
    const sessionValidation = enhancedAuth.validateSession(sessionId, request);
    if (!sessionValidation.valid) {
      throw createAuthError(ErrorCodes.SESSION_EXPIRED);
    }

    // Get user from token
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    // Get all active sessions for the user
    const activeSessions = enhancedAuth.getUserActiveSessions(user.id);

    // Get session statistics
    const sessionStats = enhancedAuth.getSessionStats();

    return NextResponse.json({
      currentSession: sessionValidation.session,
      activeSessions: activeSessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        isCurrent: session.id === sessionId,
      })),
      sessionStats,
    });
  } catch (error) {
    console.error("Session management error:", error);

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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetSessionId = searchParams.get("sessionId");
    const allSessions = searchParams.get("all") === "true";

    const currentSessionId = request.cookies.get("admin_session_id")?.value;
    const token = request.cookies.get("admin_token")?.value;

    if (!currentSessionId || !token) {
      throw createAuthError(ErrorCodes.SESSION_EXPIRED);
    }

    // Get user from token
    const user = await enhancedAuth.validateToken(token);
    if (!user) {
      throw createAuthError(ErrorCodes.TOKEN_INVALID);
    }

    if (allSessions) {
      // Invalidate all sessions except current
      const activeSessions = enhancedAuth.getUserActiveSessions(user.id);
      for (const session of activeSessions) {
        if (session.id !== currentSessionId) {
          enhancedAuth.invalidateSession(session.id);
        }
      }

      return NextResponse.json({
        message: "All other sessions have been terminated",
        terminatedSessions: activeSessions.length - 1,
      });
    }

    if (targetSessionId) {
      // Invalidate specific session
      if (targetSessionId === currentSessionId) {
        return NextResponse.json(
          { error: "Cannot terminate current session" },
          { status: 400 },
        );
      }

      enhancedAuth.invalidateSession(targetSessionId);

      return NextResponse.json({
        message: "Session terminated successfully",
        terminatedSessionId: targetSessionId,
      });
    }

    return NextResponse.json(
      { error: "Session ID or 'all' parameter required" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Session termination error:", error);

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
