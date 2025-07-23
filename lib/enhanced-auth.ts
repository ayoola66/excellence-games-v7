import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export interface DeviceFingerprint {
  userAgent: string;
  ipAddress: string;
  acceptLanguage: string;
  acceptEncoding: string;
  fingerprint: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceFingerprint: DeviceFingerprint;
  createdAt: number;
  lastActivity: number;
  expiresAt: number;
  isActive: boolean;
  ipAddress: string;
  userAgent: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  accessLevel: string;
  permissions: string[];
  lastLogin?: number;
  loginCount?: number;
}

export interface SecurityEvent {
  type:
    | "LOGIN"
    | "LOGOUT"
    | "TOKEN_REFRESH"
    | "FAILED_LOGIN"
    | "SUSPICIOUS_ACTIVITY";
  userId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  details?: any;
}

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

// In-memory stores (in production, use Redis or database)
const activeSessions = new Map<string, SessionInfo>();
const securityEvents: SecurityEvent[] = [];
const blacklistedTokens = new Set<string>();

export class EnhancedAuthService {
  private static instance: EnhancedAuthService;

  static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  /**
   * Generate device fingerprint from request headers
   */
  generateDeviceFingerprint(req: NextRequest): DeviceFingerprint {
    const userAgent = req.headers.get("user-agent") || "";
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const acceptLanguage = req.headers.get("accept-language") || "";
    const acceptEncoding = req.headers.get("accept-encoding") || "";

    const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    const fingerprint = crypto
      .createHash("sha256")
      .update(fingerprintData)
      .digest("hex");

    return {
      userAgent,
      ipAddress,
      acceptLanguage,
      acceptEncoding,
      fingerprint,
    };
  }

  /**
   * Create new session with enhanced tracking
   */
  createSession(
    userId: string,
    deviceFingerprint: DeviceFingerprint,
  ): SessionInfo {
    const sessionId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

    const session: SessionInfo = {
      id: sessionId,
      userId,
      deviceFingerprint,
      createdAt: now,
      lastActivity: now,
      expiresAt,
      isActive: true,
      ipAddress: deviceFingerprint.ipAddress,
      userAgent: deviceFingerprint.userAgent,
    };

    activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Validate session and check for suspicious activity
   */
  validateSession(
    sessionId: string,
    req: NextRequest,
  ): { valid: boolean; session?: SessionInfo; reason?: string } {
    const session = activeSessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: "Session not found" };
    }

    if (!session.isActive) {
      return { valid: false, reason: "Session inactive" };
    }

    if (Date.now() > session.expiresAt) {
      this.invalidateSession(sessionId);
      return { valid: false, reason: "Session expired" };
    }

    // Check device fingerprint for suspicious activity
    const currentFingerprint = this.generateDeviceFingerprint(req);
    if (
      session.deviceFingerprint.fingerprint !== currentFingerprint.fingerprint
    ) {
      this.logSecurityEvent({
        type: "SUSPICIOUS_ACTIVITY",
        userId: session.userId,
        ipAddress: currentFingerprint.ipAddress,
        userAgent: currentFingerprint.userAgent,
        timestamp: Date.now(),
        details: {
          reason: "Device fingerprint mismatch",
          originalFingerprint: session.deviceFingerprint.fingerprint,
          currentFingerprint: currentFingerprint.fingerprint,
        },
      });

      // For now, log but don't invalidate (could be legitimate browser update)
      // In production, you might want to require re-authentication
    }

    // Update last activity
    session.lastActivity = Date.now();
    activeSessions.set(sessionId, session);

    return { valid: true, session };
  }

  /**
   * Invalidate session
   */
  invalidateSession(sessionId: string): void {
    const session = activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      activeSessions.set(sessionId, session);
    }
  }

  /**
   * Invalidate all sessions for a user (useful for logout from all devices)
   */
  invalidateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        session.isActive = false;
        activeSessions.set(sessionId, session);
      }
    }
  }

  /**
   * Get active sessions for a user
   */
  getUserActiveSessions(userId: string): SessionInfo[] {
    return Array.from(activeSessions.values()).filter(
      (session) => session.userId === userId && session.isActive,
    );
  }

  /**
   * Enhanced token validation with blacklist check
   */
  async validateToken(token: string): Promise<AdminUser | null> {
    if (blacklistedTokens.has(token)) {
      return null;
    }

    try {
      const response = await fetch(`${STRAPI_URL}/api/admin/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }

      const userData = await response.json();
      return {
        id: userData.admin.id.toString(),
        email: userData.admin.email,
        firstName: userData.admin.firstName,
        lastName: userData.admin.lastName,
        role: userData.admin.role?.name || "admin",
        accessLevel: userData.admin.accessLevel || "full",
        permissions: userData.admin.permissions || [],
        lastLogin: userData.admin.lastLogin,
        loginCount: userData.admin.loginCount,
      };
    } catch (error) {
      console.error("Token validation error:", error);
      return null;
    }
  }

  /**
   * Enhanced token refresh with rotation
   */
  async refreshTokenWithRotation(refreshToken: string): Promise<{
    token: string;
    refreshToken: string;
    oldTokenBlacklisted: boolean;
  } | null> {
    if (blacklistedTokens.has(refreshToken)) {
      return null;
    }

    try {
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
        return null;
      }

      const data = await response.json();

      // Blacklist the old refresh token
      blacklistedTokens.add(refreshToken);

      return {
        token: data.token,
        refreshToken: data.refreshToken,
        oldTokenBlacklisted: true,
      };
    } catch (error) {
      console.error("Token refresh error:", error);
      return null;
    }
  }

  /**
   * Blacklist token (for logout or security breach)
   */
  blacklistToken(token: string): void {
    blacklistedTokens.add(token);
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: SecurityEvent): void {
    securityEvents.push(event);

    // Keep only last 1000 events in memory
    if (securityEvents.length > 1000) {
      securityEvents.splice(0, securityEvents.length - 1000);
    }

    // In production, also log to external service or database
    console.log(`[SECURITY] ${event.type}:`, event);
  }

  /**
   * Get security events for analysis
   */
  getSecurityEvents(userId?: string, limit: number = 100): SecurityEvent[] {
    let events = securityEvents;

    if (userId) {
      events = events.filter((event) => event.userId === userId);
    }

    return events.slice(-limit);
  }

  /**
   * Check for concurrent sessions limit
   */
  checkConcurrentSessionLimit(
    userId: string,
    maxSessions: number = 5,
  ): boolean {
    const activeSessions = this.getUserActiveSessions(userId);
    return activeSessions.length < maxSessions;
  }

  /**
   * Enhanced login with session management
   */
  async enhancedLogin(
    email: string,
    password: string,
    req: NextRequest,
  ): Promise<{
    success: boolean;
    user?: AdminUser;
    token?: string;
    refreshToken?: string;
    sessionId?: string;
    error?: string;
  }> {
    const deviceFingerprint = this.generateDeviceFingerprint(req);

    try {
      // Call Strapi login
      const response = await fetch(`${STRAPI_URL}/api/admin/auth/local`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email,
          password: password,
        }),
      });

      if (!response.ok) {
        this.logSecurityEvent({
          type: "FAILED_LOGIN",
          ipAddress: deviceFingerprint.ipAddress,
          userAgent: deviceFingerprint.userAgent,
          timestamp: Date.now(),
          details: { email, reason: "Invalid credentials" },
        });

        return { success: false, error: "Invalid credentials" };
      }

      const data = await response.json();
      const user = await this.validateToken(data.token);

      if (!user) {
        return { success: false, error: "Failed to validate user" };
      }

      // Check concurrent session limit
      if (!this.checkConcurrentSessionLimit(user.id)) {
        return {
          success: false,
          error: "Too many active sessions. Please logout from other devices.",
        };
      }

      // Create session
      const session = this.createSession(user.id, deviceFingerprint);

      // Log successful login
      this.logSecurityEvent({
        type: "LOGIN",
        userId: user.id,
        ipAddress: deviceFingerprint.ipAddress,
        userAgent: deviceFingerprint.userAgent,
        timestamp: Date.now(),
        details: { sessionId: session.id },
      });

      return {
        success: true,
        user,
        token: data.token,
        refreshToken: data.refreshToken,
        sessionId: session.id,
      };
    } catch (error) {
      console.error("Enhanced login error:", error);
      return { success: false, error: "Login failed" };
    }
  }

  /**
   * Enhanced logout with session cleanup
   */
  async enhancedLogout(sessionId: string, token: string): Promise<void> {
    const session = activeSessions.get(sessionId);

    if (session) {
      this.logSecurityEvent({
        type: "LOGOUT",
        userId: session.userId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        timestamp: Date.now(),
        details: { sessionId },
      });

      this.invalidateSession(sessionId);
    }

    // Blacklist the token
    this.blacklistToken(token);
  }

  /**
   * Clean up expired sessions (should be run periodically)
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of activeSessions.entries()) {
      if (now > session.expiresAt) {
        activeSessions.delete(sessionId);
      }
    }
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalActiveSessions: number;
    sessionsByUser: Record<string, number>;
    oldestSession: number;
    newestSession: number;
  } {
    const activeSessionsList = Array.from(activeSessions.values()).filter(
      (session) => session.isActive,
    );

    const sessionsByUser: Record<string, number> = {};
    let oldestSession = Date.now();
    let newestSession = 0;

    for (const session of activeSessionsList) {
      sessionsByUser[session.userId] =
        (sessionsByUser[session.userId] || 0) + 1;
      oldestSession = Math.min(oldestSession, session.createdAt);
      newestSession = Math.max(newestSession, session.createdAt);
    }

    return {
      totalActiveSessions: activeSessionsList.length,
      sessionsByUser,
      oldestSession,
      newestSession,
    };
  }
}

export const enhancedAuth = EnhancedAuthService.getInstance();
